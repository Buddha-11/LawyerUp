import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../context/firebase";
import { useFirebase } from "../context/firebase";
import Navbar from "./Navbar";

const UserProfile = () => {
  const { currentUser, loading: authLoading } = useFirebase();
  const [userData, setUserData] = useState(null);
  const [chatSummaries, setChatSummaries] = useState([]);
  const [docExplanations, setDocExplanations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) {
        console.warn("❌ No user logged in.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile data
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData(userSnap.data());

        // Fetch recent chatbot messages
        const chatbotRef = doc(db, "chatbots", currentUser.uid);
        const chatbotSnap = await getDoc(chatbotRef);
        if (chatbotSnap.exists()) {
          const chats = chatbotSnap.data().chats || [];
          const recentChats = chats.slice(-2).reverse(); // last 2 chats
          setChatSummaries(recentChats);
        }

        // Fetch document analyzer data
        const docsRef = collection(db, "users", currentUser.uid, "documents");
        const docsSnap = await getDocs(docsRef);
        const explanations = [];
        docsSnap.forEach(doc => {
          const data = doc.data();
          if (data.answer) {
            explanations.push({
              fileName: data.fileName || "Document",
              answer: data.answer.slice(0, 150) + "...", // truncate
            });
          }
        });
        setDocExplanations(explanations.slice(0, 2)); // last 2 explanations
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      setLoading(false);
    };

    // Only fetch when auth loading is done
    if (!authLoading) fetchAllData();
  }, [currentUser, authLoading]);

  if (authLoading || loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-teal-600 text-xl font-medium">Loading profile...</div>
    </div>
  );

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <>
        <Navbar/>
    <div className="flex h-screen bg-slate-50">
        
      {/* Left half - Profile section */}
      <div className="w-1/2 flex flex-col bg-teal-700 text-white ml-2">
        {/* Large profile image */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative w-64 h-64 rounded-full border-4 border-slate-200 overflow-hidden shadow-lg">
            <img
              src={userData?.photoURL || "/api/placeholder/400/400"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* User details at bottom */}
        <div className="p-8 bg-teal-800">
          <h2 className="text-3xl font-bold mb-6">{userData?.name || "User Name"}</h2>
          <div className="space-y-4">
            <div className="flex items-center bg-teal-900/40 p-3 rounded-lg">
              <span className="w-24 text-teal-200 font-medium">Email:</span>
              <span className="text-white">{userData?.email || "email@example.com"}</span>
            </div>
            <div className="flex items-center bg-teal-900/40 p-3 rounded-lg">
              <span className="w-24 text-teal-200 font-medium">Phone:</span>
              <span className="text-white">{userData?.phone || "+1 (555) 123-4567"}</span>
            </div>
            <div className="flex items-center bg-teal-900/40 p-3 rounded-lg">
              <span className="w-24 text-teal-200 font-medium">Location:</span>
              <span className="text-white">{userData?.location || "Not specified"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right half - Recent activity */}
      <div className="w-1/2 flex flex-col overflow-y-auto bg-slate-100">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 pb-2 border-b-2 border-teal-500">Recent Activity</h2>

          {/* Recent Chats */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-teal-700 mb-4 flex items-center bg-teal-50 p-2 rounded-t-lg border-l-4 border-teal-500">
              <span className="mr-2">💬</span>
              Recent Chats with LawBot
            </h3>
            {chatSummaries.length === 0 ? (
              <div className="p-4 rounded-lg bg-white text-slate-600 shadow-sm border border-slate-200">
                No recent chats found.
              </div>
            ) : (
              <div className="space-y-4">
                {chatSummaries.map((chat, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                    {chat.messages.map((msg, j) => (
                      <div key={j} className={`mb-2 p-3 rounded-lg ${msg.sender === "user" ? "bg-teal-50 border-l-4 border-teal-400" : "bg-slate-50 border-l-4 border-slate-400"}`}>
                        <p className="text-sm">
                          <span className={`font-medium ${msg.sender === "user" ? "text-teal-600" : "text-slate-700"}`}>
                            {msg.sender === "user" ? "You:" : "LawBot:"}
                          </span>{" "}
                          {truncateText(msg.text, 100)}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Analyzer Results */}
          <div>
            <h3 className="text-lg font-medium text-teal-700 mb-4 flex items-center bg-teal-50 p-2 rounded-t-lg border-l-4 border-teal-500">
              <span className="mr-2">📄</span>
              Document Analysis
            </h3>
            {docExplanations.length === 0 ? (
              <div className="p-4 rounded-lg bg-white text-slate-600 shadow-sm border border-slate-200">
                No analysis results available.
              </div>
            ) : (
              <div className="space-y-4">
                {docExplanations.map((doc, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                    <h4 className="font-medium text-teal-600 mb-2 pb-1 border-b border-slate-200">{doc.fileName}</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{truncateText(doc.answer, 100)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default UserProfile;