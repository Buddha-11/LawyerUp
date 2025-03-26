import React from "react";

const MessageItem = ({ message }) => (
  <div className={`flex mb-4 ${message.isBot ? "justify-start" : "justify-end"}`}>
    <div className={`${message.isBot ? "bg-gray-300" : "bg-blue-500 text-white"} rounded-lg p-3 max-w-xs`}>
      {message.text}
    </div>
  </div>
);

export default MessageItem;
