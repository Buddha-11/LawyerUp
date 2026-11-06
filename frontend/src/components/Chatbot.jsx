import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { firebaseAuth, db } from "../context/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { chatHistory, chatText } from "./chatProtocol";

import Navbar from "./Navbar";
import { Plus, Trash2, Send, MessageSquare, Menu, X } from "lucide-react";

const Chatbot = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const [userUID, setUserUID] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const sendingRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      setUserUID(null);
      setHistoryLoaded(false);
      setStorageError("");
      setChats([]);
      setActiveChatId(null);
      if (!user) return;
      try {
        const docRef = doc(db, "chatbots", user.uid);
        const docSnap = await getDoc(docRef);
        if (disposed || firebaseAuth.currentUser?.uid !== user.uid) return;
        const savedChats = docSnap.exists() ? docSnap.data().chats || [] : [];
        setChats(savedChats);
        setActiveChatId(savedChats[0]?.id ?? null);
        // Enable writes only after hydration, so saved chats cannot be erased.
        setUserUID(user.uid);
        setHistoryLoaded(true);
      } catch (error) {
        if (!disposed && firebaseAuth.currentUser?.uid === user.uid) {
          console.error("Unable to load chats", error);
          setStorageError("Saved chats could not be loaded. New messages will stay in this session.");
        }
      }
    });
    return () => { disposed = true; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (userUID && historyLoaded) {
      const userRef = doc(db, "chatbots", userUID);
      const timer = setTimeout(() => {
        if (firebaseAuth.currentUser?.uid !== userUID) return;
        setDoc(userRef, { chats }, { merge: true }).then(() => {
          setStorageError("");
        }).catch((error) => {
          console.error("Unable to save chats", error);
          setStorageError("Messages could not be saved. Keep this page open and check your connection.");
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [chats, userUID, historyLoaded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId, loading]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleNewChat = () => {
    const newChat = { id: uuidv4(), title: "New Chat", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setSidebarOpen(false);
  };

  const deleteChat = (id) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== id));
    if (activeChatId === id) {
      setActiveChatId(chats.length > 1 ? chats.find(c => c.id !== id)?.id : null);
    }
  };

  const generateChatTitle = (message) => {
    return message.length > 28 ? message.substring(0, 28) + "…" : message;
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !activeChat || sendingRef.current) return;
    sendingRef.current = true;
    setLoading(true);
    const requestChatId = activeChatId;
    const requestUserUID = firebaseAuth.currentUser?.uid;

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
      const CHATBOT_URL = (import.meta.env.VITE_CHATBOT_URL || "https://lawyerup-chatbot-1030063559705.asia-south1.run.app").replace(/\/$/, "");
      const response = await axios.post(
        `${CHATBOT_URL}/chat/get`,
        { msg: inputForAPI, history: chatHistory(activeChat.messages) },
        { headers: { "Content-Type": "application/json" }, timeout: 150000 }
      );
      if (typeof response.data.response !== "string" || !response.data.response.trim()) {
        throw new Error("The assistant returned an empty response.");
      }
      if (firebaseAuth.currentUser?.uid !== requestUserUID) return;
      const botMsg = { sender: "bot", text: chatText(response.data.response) };
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === requestChatId
            ? { ...chat, messages: [...chat.messages, botMsg] }
            : chat
        )
      );
    } catch (err) {
      console.error(err);
      if (firebaseAuth.currentUser?.uid !== requestUserUID) return;
      const errorMsg = {
        sender: "bot", isError: true,
        text: typeof err.response?.data?.error === "string"
          ? err.response.data.error
          : "The assistant could not be reached. Please try again.",
      };
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === requestChatId
            ? { ...chat, messages: [...chat.messages, errorMsg] }
            : chat
        )
      );
    } finally {
      sendingRef.current = false;
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F8F8]">
      <Navbar />
      {storageError && <p role="status" className="bg-amber-50 px-4 py-2 text-sm text-amber-900">{storageError}</p>}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-xl z-40
            transform transition-transform duration-300
            lg:static lg:translate-x-0 lg:shadow-none lg:z-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{ paddingTop: sidebarOpen ? "0" : undefined }}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">AI Legal Assistant</span>
              <button
                className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3 border-b border-gray-100">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                           bg-teal-600 hover:bg-teal-700 rounded-lg
                           text-white text-sm font-medium transition-all duration-200 shadow-sm"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto py-2">
              {chats.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  No chats yet. Start a new one!
                </div>
              )}
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg mb-1
                               group transition-all duration-200 cursor-pointer
                               ${activeChatId === chat.id
                                 ? "bg-teal-50 border border-teal-200"
                                 : "hover:bg-gray-50"}`}
                  onClick={() => { setActiveChatId(chat.id); setSidebarOpen(false); }}
                >
                  <span
                    className={`flex-1 text-sm truncate ${
                      activeChatId === chat.id
                        ? "text-teal-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {chat.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    className="ml-2 p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <div className="flex flex-col flex-1 min-w-0 bg-[#F0F8F8]">
          {/* Chat Header */}
          <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-800 truncate">
                {activeChat ? activeChat.title : "Select or start a chat"}
              </h1>
            </div>
          </header>

          {/* Messages */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {!activeChat ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Start a Conversation</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                  Ask any legal question and get AI-powered answers instantly.
                </p>
                <button
                  onClick={handleNewChat}
                  className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {activeChat.messages.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-3">
                      <MessageSquare size={24} className="text-teal-500" />
                    </div>
                    <p className="text-gray-500 text-sm">Type a legal question to get started.</p>
                  </div>
                )}
                {activeChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === "user"
                          ? "bg-teal-600 text-white rounded-tr-sm"
                          : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                      }`}
                    >
                      {msg.sender === "bot" ? (
                        <div
                          className="text-sm leading-relaxed"
                          style={{ whiteSpace: "pre-line" }}
                        >{chatText(msg.text)}</div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading dots */}
                {loading && (
                  <div className="flex justify-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </main>

          {/* Input Field */}
          {activeChat && (
            <footer className="p-3 md:p-4 bg-white border-t border-gray-100">
              <div className="max-w-3xl mx-auto flex gap-3">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a legal question..."
                  rows={1}
                  maxLength={8000}
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm text-gray-800 placeholder-gray-400 transition-all"
                  style={{ maxHeight: "120px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !userInput.trim()}
                  className="flex items-center justify-center w-11 h-11 bg-teal-600
                          hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed
                          rounded-xl text-white transition-all shadow-sm self-end"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                AI Legal Assistant · Responses are for informational purposes only
              </p>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
