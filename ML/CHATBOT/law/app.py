
'''from flask import Flask, render_template, request
from src.helper import download_hugging_face_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from src.prompt import *
import os

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

# Load embeddings
embeddings = download_hugging_face_embeddings()
index_name = "lawbot"

# Embed each chunk and upsert the embeddings into your Pinecone index
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# Initialize LLM model
llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name="llama3-8b-8192")

# Create chat prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

# Create retrieval and question-answer chains
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

# Routes
@app.route("/")
def index():
    return render_template('chat.html')

@app.route("/get", methods=["POST"])
def chat():
    msg = request.form.get("msg", "").strip()  # Safely get message input
    if not msg:
        return "Error: No input received."

    print(f"User Input: {msg}")

    # Get response from RAG chain
    response = rag_chain.invoke({"input": msg})
    bot_answer = response.get("answer", "Sorry, I couldn't generate a response.")

    # Ensure response appears on separate lines by replacing periods with <br> tags
    formatted_response = bot_answer.replace(". ", ".<br>")

    print("Response:\n", formatted_response)  # Debugging
    return formatted_response  # Return as HTML response so <br> tags are rendered

# Run Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)'''
from flask import Flask, render_template, request
from src.helper import download_hugging_face_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from src.prompt import *
import os
from flask_cors import CORS  # Import Flask-CORS


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

# Enable CORS for the entire Flask app
CORS(app)

# Load embeddings
embeddings = download_hugging_face_embeddings()
index_name = "lawbot"

# Connect to the existing Pinecone index
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# Initialize LLM model
llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name="llama3-8b-8192")

# Custom prompt template with memory support
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
@app.route("/")
def index():
    return render_template('chat.html')

@app.route("/get", methods=["POST"])
def chat():
    data = request.json
    msg = data.get("msg", "").strip()

    if not msg:
        return "Error: No input received."

    # Get response from the model
    response = rag_chain({"question": msg})
    bot_answer = response.get("answer", "Sorry, I couldn't generate a response.")

    # Send the response back as JSON
    return bot_answer
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)

