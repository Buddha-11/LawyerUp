import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { firebaseAuth, db } from "../context/firebase"; // adjust this path as needed
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
      <aside className="w-64 bg-[#202123] border-r border-white/20 flex flex-col">
        {/* Chatbot Title */}
        <div className="p-4 border-b border-white/20 text-center text-lg font-bold">
          Chatbot
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-white/20">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 p-3 bg-transparent hover:bg-[#2A2B32] 
                       rounded-md border border-white/20 transition-colors"
          >
            ➕ New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between px-4 py-3 border-b border-white/10 hover:bg-[#2A2B32] transition-colors">
              <button
                onClick={() => setActiveChatId(chat.id)}
                className={`flex-1 text-left ${activeChatId === chat.id ? "font-semibold" : ""}`}
              >
                {chat.title}
              </button>
              <button onClick={() => deleteChat(chat.id)} className="ml-2 text-gray-400 hover:text-gray-300">
                🗑️
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="flex flex-col flex-1">
        {/* Chat Title */}
        <header className="p-4 bg-[#202123] border-b border-white/20">
          <h1 className="text-lg font-semibold">
            {activeChat ? activeChat.title : "No Chat Selected"}
          </h1>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeChat?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`max-w-[80%] rounded-md px-4 py-3 ${
                  msg.sender === "user"
                    ? "bg-[#0B5FFF] text-white"
                    : "bg-[#444654] text-[#ececf1]"
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
              </div>
            </div>
          ))}

          {loading && (
            <div className="w-full flex justify-start mb-4">
              <div className="max-w-[80%] rounded-md px-4 py-3 bg-[#444654] text-[#ececf1]">Typing...</div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </main>

        {/* Input Field */}
        {activeChat && (
          <footer className="p-4 bg-[#202123] border-t border-white/20 flex space-x-2">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 p-2 bg-[#343541] border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-[#0B5FFF] 
                         hover:bg-[#0a4fd5] rounded text-white 
                         disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                "➡️"
              )}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
