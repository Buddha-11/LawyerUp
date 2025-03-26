import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";

const Chat = () => {
  const [messages, setMessages] = useState([]);

  const addMessage = (message, isBot = false) => {
    setMessages([...messages, { text: message, isBot }]);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg">
        <ChatHeader />
        <MessageList messages={messages} />
        <MessageForm addMessage={addMessage} />
      </div>
    </div>
  );
};

export default Chat;
