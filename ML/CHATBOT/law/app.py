from flask import Flask, render_template, request, jsonify
from src.helper import download_hugging_face_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from flask_cors import CORS
import os

import re

def format_response(text):
    # Remove ** from bold text
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)

    # Convert numbered points into separate lines
    text = re.sub(r"(\d+\.)", r"<br>\1", text)  

    # Bold headings
    text = re.sub(r"(\d+\.\s)(.*?):", r"\1<b>\2</b>:", text)  

    # Ensure newlines are converted to <br> tags
    text = text.replace("\n", "<br>")

    return text.strip()



# Load environment variables
load_dotenv()

# Retrieve API keys
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")

# Ensure API keys are set
if not PINECONE_API_KEY:
    raise ValueError("Missing PINECONE_API_KEY. Please set it in your environment variables.")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Load embeddings
embeddings = download_hugging_face_embeddings()
index_name = "lawbot2"

# Connect to the existing Pinecone index
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# Initialize LLM model
llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name="llama3-8b-8192")

# Custom prompt template with memory support
system_prompt = system_prompt = (
    "You're LawBot, a friendly AI helping people understand Indian legal cases in simple, modern English. "
    "Speak clearly, be helpful, and sound like you're chatting with a friend—not a courtroom judge. "
    "Use examples when needed. Avoid legal jargon unless asked. Keep it chill, but informative."
   
    
)

# system_prompt = system_prompt = (
#     "You're LawBot, a friendly AI that helps people understand Indian legal cases in simple, modern English. "
#     "Speak clearly, be helpful, and sound like you're chatting with a friend—not a courtroom judge. "
#     "Use real-life examples when needed. Avoid legal jargon unless asked. Keep it chill but informative. "

#     "\n\nWhen there are steps involved, follow this format:\n"
#     "Step 1: Give the heading like this (no bold or symbols)\n"
#     "• Use bullets with a plain dot symbol (like this)\n"
#     "• Keep the text left-aligned and well spaced\n"
#     "• Do not use any Markdown formatting — no **, __, *, #, or HTML tags like <br>\n"

#     "\nKeep everything as plain text. The goal is to make the message easy to read without any styling symbols. "
#     "Structure your answers cleanly using headings and bullet points in plain English."
# )



template = f"""{system_prompt}

**Chat History**:
{{chat_history}}

**Context**:
{{context}}

**Question**: {{question}}

**Answer**:"""

prompt = PromptTemplate.from_template(template)

# Initialize conversation memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    input_key="question",
    output_key="answer"
)

# Create conversational retrieval chain with memory
rag_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    memory=memory,
    combine_docs_chain_kwargs={"prompt": prompt},
    return_source_documents=True
)

# Routes
@app.route("/chat")
def index():
    return render_template('chat.html')

@app.route("/chat/get", methods=["POST"])
def chat():
    data = request.json
    msg = data.get("msg", "").strip()

    if not msg:
        return jsonify({"error": "No input received."})

    # Get response from the model
    response = rag_chain({"question": msg})
    bot_answer = response.get("answer", "Sorry, I couldn't generate a response.")

    # Format response
    # formatted_response = bot_answer.replace(". ", ".<br>")
    # formatted_response = format_response(bot_answer)
    formatted_response = bot_answer.replace("\n", "<br>")



    return jsonify({"response": formatted_response})

@app.route("/chat_history", methods=["GET"])
def chat_history():
    # Retrieve the conversation history
    chat_history = memory.load_memory_variables({})["chat_history"]
    return jsonify({"history": chat_history})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)
