"""HTTP API for LawBot. Conversation history belongs to each request."""

import logging
import os
from html import escape

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from src.chat_service import build_chain

MAX_MESSAGE_LENGTH = 8000
MAX_HISTORY_MESSAGES = 24


def validate_input(data):
    if not isinstance(data, dict):
        raise ValueError("Send a JSON object containing a message.")
    message = data.get("msg")
    if not isinstance(message, str) or not message.strip():
        raise ValueError("Enter a message before sending.")
    if len(message) > MAX_MESSAGE_LENGTH:
        raise ValueError("Keep your message under 8,000 characters.")
    history = data.get("history", [])
    if not isinstance(history, list) or len(history) > MAX_HISTORY_MESSAGES:
        raise ValueError("Send at most 24 previous messages.")
    pairs = []
    pending_question = None
    for item in history:
        if not isinstance(item, dict):
            raise ValueError("Invalid conversation history.")
        sender, text = item.get("sender"), item.get("text")
        if sender not in ("user", "bot") or not isinstance(text, str):
            raise ValueError("Invalid conversation history.")
        if len(text) > MAX_MESSAGE_LENGTH:
            raise ValueError("A previous message is too long.")
        if sender == "user":
            pending_question = text
        elif pending_question is not None:
            pairs.append((pending_question, text))
            pending_question = None
    return message.strip(), pairs


def create_app(chain=None):
    load_dotenv()
    app = Flask(__name__)
    app.config.update(MAX_CONTENT_LENGTH=128 * 1024, DEBUG=False)
    CORS(app)
    # Initialize once per worker, but never store user history in the chain.
    if chain is None:
        chain = build_chain()

    @app.get("/health")
    def health():
        return jsonify(status="ok", revision=os.getenv("K_REVISION", "local"))

    @app.get("/chat")
    def index():
        return render_template("chat.html")

    @app.post("/chat/get")
    def chat():
        try:
            message, history = validate_input(request.get_json(silent=True))
        except ValueError as error:
            return jsonify(error=str(error)), 400
        try:
            result = chain.invoke({"question": message, "chat_history": history})
            answer = result.get("answer")
            if not isinstance(answer, str) or not answer.strip():
                raise ValueError("The model returned an empty answer.")
            # Keep the existing HTML contract safe for older deployed clients.
            return jsonify(response=escape(answer.strip()).replace("\n", "<br>"))
        except Exception as error:
            # Never expose provider errors, credentials, or a debugger to clients.
            app.logger.exception("Chat generation failed (%s)", type(error).__name__)
            if getattr(error, "status_code", None) == 429:
                return jsonify(error="The assistant is busy. Please try again shortly."), 503
            return jsonify(error="The assistant is temporarily unavailable. Please try again."), 502

    @app.get("/chat_history")
    def chat_history():
        # Legacy compatibility: history is stored by the frontend in Firestore.
        return jsonify(history=[])

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code

    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_app().run(host="0.0.0.0", port=int(os.getenv("PORT", "5002")), debug=False)
