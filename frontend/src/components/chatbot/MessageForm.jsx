import React, { useState } from "react";
import axios from "axios";

const MessageForm = ({ addMessage }) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Add user message to chat
    addMessage(text);

    // Send message to Flask backend
    try {
      const response = await axios.post("http://localhost:8080/get", { msg: text });
      addMessage(response.data, true);
    } catch (error) {
      console.error("Error fetching bot response:", error);
    }

    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
        placeholder="Type your message..."
        required
      />
      <button
        type="submit"
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Send
      </button>
    </form>
  );
};

export default MessageForm;
