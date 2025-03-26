import React from "react";

const ChatHeader = () => (
  <div className="p-4 bg-blue-500 rounded-t-lg flex items-center">
    <div className="flex items-center">
      <img
        src="https://i.pinimg.com/736x/85/8e/7c/858e7cb601a22329924301ef1ccb8227.jpg"
        alt="User Avatar"
        className="w-10 h-10 rounded-full"
      />
      <div className="ml-3">
        <h2 className="text-white text-lg">LawyerUp</h2>
        <p className="text-white">Ask me anything!</p>
      </div>
    </div>
  </div>
);

export default ChatHeader;
