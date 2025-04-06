from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

VECTOR_STORE_PATH = "faiss_index"
TEXT_FILE_PATH = "uploaded_text.txt"

# Function to extract text from PDF
def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    return text.strip()

# Function to split text into chunks
def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    return text_splitter.split_text(text)

# Function to create vector store
def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local(VECTOR_STORE_PATH)

# Function to generate explanation of document
def generate_explanation(text, language):
    prompt = f"""
        "You are a legal expert and document interpreter. Your task is to:\n"
    "1. Analyze the provided legal document.\n"
    "2. Explain it in simple {language} using everyday language.\n"
    "3. Break down complex legal terms into plain language.\n"
    "4. Clearly mention key obligations, rights, and deadlines.\n"
    "5. Provide a summary checklist for the user.\n"
    "6. Each point must appear on its own line and be prefixed by a dash (-), like this:\n"
    "- Point 1\n"
    "- Point 2\n"
    "- Point 3\n"
    "7. Use \\n for every new line to enforce line breaks where needed.\n"
    "8. Do NOT use markdown formatting like ** or * at all.\n"
    "9. Ensure proper spacing and readability throughout.\n"


    Document Content:
    {text}

    Explanation:
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    
    return response.text

# Function to create conversational chain
def get_conversational_chain():
    prompt_template = """
    "You are a multilingual legal assistant. Follow these rules carefully:\n\n"
    "1. Always respond in the same language as the question.\n"
    "2. If the question is in Marathi, respond in Marathi.\n"
    "3. If the question is in Hindi, respond in Hindi.\n"
    "4. If the question is in English, respond in English.\n"
    "5. If the answer is not available in the context, still respond helpfully as a legal assistant.\n"
    "6. Always provide accurate, legally sound, and easy-to-understand responses.\n\n"
    "When providing your response:\n"
    "- Use clean line breaks between paragraphs.\n"
    "- Use bullet points (•) for listing steps or points.\n"
    "- Do not use bold formatting like ** or __.\n"
    "- Keep the language natural, respectful, and professional.\n"
    "- Structure your response for readability with proper spacing.\n"

    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(model, chain_type="stuff", prompt=prompt)

# Function to answer user questions based on processed documents
def answer_question(user_question):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    # Check if FAISS index exists
    if not os.path.exists(VECTOR_STORE_PATH):
        return "No document found. Please upload a document first."

    new_db = FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(user_question)
    chain = get_conversational_chain()
    
    response = chain(
        {"input_documents": docs, "question": user_question},
        return_only_outputs=True
    )
    return response["output_text"]

# API endpoint to upload and process PDFs
@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "pdfs" not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400

    pdf_files = request.files.getlist("pdfs")
    text = get_pdf_text(pdf_files)
    
    if not text:
        return jsonify({"error": "No text found in the uploaded PDFs"}), 400

    text_chunks = get_text_chunks(text)
    get_vector_store(text_chunks)

    # Save extracted text for explanation use
    with open(TEXT_FILE_PATH, "w", encoding="utf-8") as f:
        f.write(text)

    return jsonify({"message": "PDFs processed successfully!"})

# API endpoint to generate document explanation
@app.route("/explain", methods=["GET"])
def explain():
    language = request.args.get("language", "English")

    # Load stored text
    if not os.path.exists(TEXT_FILE_PATH):
        return jsonify({"error": "No document found. Please upload a document first."}), 404

    with open(TEXT_FILE_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    explanation = generate_explanation(text, language)
    return jsonify({"explanation": explanation})

# API endpoint to ask legal questions
@app.route("/ask", methods=["POST"])
def ask_question():
    data = request.get_json()
    user_question = data.get("question")

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    answer = answer_question(user_question)
    return jsonify({"answer": answer})

# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
