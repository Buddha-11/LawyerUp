import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { firebaseAuth, db } from "../context/firebase"; // adjust this path as needed
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import ProfileMenu from "./ProfileMenu";

const Chatbot = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [userUID, setUserUID] = useState(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserUID(user.uid);
        const docRef = doc(db, "chatbots", user.uid);
        const docSnap = await getDoc(docRef);
        const savedChats = docSnap.exists() ? docSnap.data().chats || [] : [];
        setChats(savedChats);
        if (savedChats.length > 0) {
          setActiveChatId(savedChats[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (userUID) {
  //     const userRef = doc(db, "chatbots", userUID);
  //     updateDoc(userRef, { chats }).catch(() =>
  //       setDoc(userRef, { chats })
  //     );
  //   }
  // }, [chats, userUID]);


  useEffect(() => {
    if (userUID) {
      const userRef = doc(db, "chatbots", userUID);
  
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          updateDoc(userRef, { chats });
        } else {
          setDoc(userRef, { chats }, { merge: true });
        }
      });
    }
  }, [chats, userUID]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId, loading]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleNewChat = () => {
    const newChat = { id: uuidv4(), title: "New Chat", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (id) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== id));
    if (activeChatId === id) {
      setActiveChatId(chats.length > 1 ? chats[1].id : null);
    }
  };

  const generateChatTitle = (message) => {
    return message.length > 15 ? message.substring(0, 15) + "..." : message;
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !activeChat) return;
    setLoading(true);

    const userMsg = { sender: "user", text: userInput };
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMsg] }
          : chat
      )
    );

    if (activeChat.messages.length === 0) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, title: generateChatTitle(userInput) }
            : chat
        )
      );
    }

    const inputForAPI = userInput;
    setUserInput("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/chat/get",
        { msg: inputForAPI },
        { headers: { "Content-Type": "application/json" } }
      );
      const botMsg = { sender: "bot", text: response.data.response };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMsg] }
            : chat
        )
      );
    } catch (err) {
      console.error(err);
      const errorMsg = { sender: "bot", text: "Oops! Something went wrong." };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, errorMsg] }
            : chat
        )
      );
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#343541] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#F0F8F8] border-r-3 border-teal-600 flex flex-col">
        {/* Chatbot Title */}
        <div className="p-4 border-b bg-teal-600 border-teal-600 text-center text-lg font-bold text-white">
          Chatbot
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-teal-600">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 p-3
                       bg-teal-600 hover:bg-teal-700 rounded-md
                       text-white font-medium transition-all duration-200
                       shadow-sm hover:shadow-md"
          >
            <span className="text-white text-xl font-bold mr-2 mb-1">+</span> New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between px-4 py-3 border-b border-teal-100
                         group transition-all duration-300 ease-in-out
                         ${activeChatId === chat.id 
                           ? "bg-[#E0F2F1] border-l-4 border-l-teal-600 pl-3" 
                           : "hover:bg-[#F5FCFC] pl-4"}`}
            >
              <button
                onClick={() => setActiveChatId(chat.id)}
                className={`flex-1 text-left text-gray-800 transition-all duration-200
                           ${activeChatId === chat.id 
                             ? "font-semibold transform scale-102" 
                             : "font-normal"}`}
              >
                {chat.title}
              </button>
              <button
                onClick={() => deleteChat(chat.id)}
                className="ml-2 text-gray-700 hover:text-red-500 transition-colors duration-200"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="flex flex-col flex-1 bg-[#F0F8F8]">
        {/* Chat Title */}
        <header className="relative p-4 bg-teal-600 text-white flex justify-center items-center shadow-md">
          <h1 className="text-lg font-semibold">
            {activeChat ? activeChat.title : "No Chat Selected"}
          </h1>
          <div className="absolute right-4">
            <ProfileMenu />
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F0F8F8]">
          {activeChat?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none border border-teal-100"
                }`}
              >
                {msg.sender === "bot" ? (
                  <div
                    style={{
                      textAlign: "left",
                      lineHeight: "1.5",
                      marginBottom: "8px",
                      whiteSpace: "pre-line",
                    }}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                ) : (
                  msg.text
                )}
                <div 
                  className={`text-xs mt-1 text-right ${
                    msg.sender === "user" ? "text-teal-100" : "text-gray-400"
                  }`}
                >
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="w-full flex justify-start mb-4">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-gray-800 rounded-tl-none border border-teal-100 shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </main>

        {/* Input Field */}
{activeChat && (
  <footer className="p-4 bg-[#F0F8F8] border-t border-teal-200 flex space-x-3">
    <div className="flex-1 relative">
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        rows={1}
        className="w-full p-3 pl-4 pr-10 bg-white border border-teal-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none shadow-sm text-gray-800 placeholder-gray-400"
      />
      {/* <button
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 transition-colors"
      >
        😊
      </button> */}
    </div>
    <button
      onClick={sendMessage}
      disabled={loading}
      className="flex items-center justify-center p-3 bg-teal-600 
              hover:bg-teal-700 rounded-full text-white
              disabled:opacity-50 transition-colors shadow-md"
    >
      {loading ? (
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
        </div>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
        </svg>
      )}
    </button>
  </footer>
)}
      </div>
    </div>
  );
};

export default Chatbot;
