import React from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages }) => (
  <div className="p-4 h-64 overflow-y-auto">
    {messages.map((msg, index) => (
      <MessageItem key={index} message={msg} />
    ))}
  </div>
);

export default MessageList;
