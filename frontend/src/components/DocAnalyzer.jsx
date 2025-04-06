import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { db } from "../context/firebase"; // adjust this path if needed
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ProfileMenu from "./ProfileMenu";

const DocAnalyzer = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState(localStorage.getItem("fileName") || "");
    const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
    const [explanation, setExplanation] = useState(localStorage.getItem("explanation") || "");
    const [showQuestionSection, setShowQuestionSection] = useState(false);
    const [question, setQuestion] = useState(localStorage.getItem("question") || "");
    const [answer, setAnswer] = useState(localStorage.getItem("answer") || "");
    const [uploading, setUploading] = useState(false);
    const [processingQuestion, setProcessingQuestion] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setFileName(localStorage.getItem("fileName") || "");
        setLanguage(localStorage.getItem("language") || "English");
        setExplanation(localStorage.getItem("explanation") || "");
        setQuestion(localStorage.getItem("question") || "");
        setAnswer(localStorage.getItem("answer") || "");
    }, []);

    useEffect(() => {
        localStorage.setItem("language", language);
        localStorage.setItem("explanation", explanation);
        localStorage.setItem("question", question);
        localStorage.setItem("answer", answer);
    }, [language, explanation, question, answer]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setFileName(file ? file.name : "");
        localStorage.setItem("fileName", file ? file.name : "");
        setError(null);
    };

    const saveToFirestore = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setError("⚠️ User not logged in. Cannot save.");
            return;
        }

        const data = {
            fileName,
            language,
            explanation,
            question,
            answer,
            timestamp: serverTimestamp()
        };

        try {
            const docId = `${fileName}_${Date.now()}`;
            await setDoc(doc(db, "users", user.uid, "documents", docId), data);
            console.log("✅ Data saved to Firestore!");
        } catch (err) {
            console.error("❌ Error saving to Firestore:", err);
            setError("Error saving to database.");
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("⚠️ Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("pdfs", selectedFile);
        setUploading(true);
        setExplanation("");
        setShowQuestionSection(false);

        try {
            await axios.post("http://127.0.0.1:8000/upload", formData);
            const response = await axios.get(`http://127.0.0.1:8000/explain?language=${language}`);
            setExplanation(response.data.explanation);
            localStorage.setItem("explanation", response.data.explanation);
            await saveToFirestore();
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("❌ Failed to process document.");
        }
        setUploading(false);
    };

    const handleAsk = async () => {
        if (!question.trim()) {
            setError("⚠️ Enter a valid question!");
            return;
        }

        setProcessingQuestion(true);
        setAnswer("⏳ Generating answer...");
        setError(null);

        try {
            const response = await axios.post("http://127.0.0.1:8000/ask", { question });
            const ans = response.data.answer || "No response received.";
            setAnswer(ans);
            localStorage.setItem("answer", ans);
            await saveToFirestore();
        } catch (error) {
            console.error("Error fetching answer:", error);
            setAnswer("❌ Error fetching answer.");
        }

        setProcessingQuestion(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#F0F8F8] text-gray-800">
            {/* Sidebar */}
            <div className="sm:w-full md:w-1/3 lg:w-1/4 bg-white p-6 fixed md:relative h-full flex flex-col justify-between shadow-md border-r border-teal-200">
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-teal-800">Legal Doc AI</h2>
                    <label className="text-lg text-gray-700">Choose Language:</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-[#F0F8F8] text-gray-800 p-2 rounded-lg mt-2 border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Marathi">Marathi</option>
                    </select>
    
                    <div className="mt-6">
                        <label className="text-lg text-gray-700">Upload PDF:</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="file-upload"
                            className="w-full bg-[#F0F8F8] text-gray-800 p-2 rounded-lg mt-2 cursor-pointer text-center block border border-teal-300 hover:bg-teal-50 transition-colors"
                        >
                            {fileName ? `📄 ${fileName}` : "Choose File"}
                        </label>
                        <button
                            onClick={handleUpload}
                            className={`bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full transition-all shadow-sm ${
                                uploading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Submit & Process"}
                        </button>
                    </div>
    
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </div>
    
                <div className="mt-8">
                    <Link
                        to="/chat"
                        className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200"
                    >
                        <span className="mr-2 text-xl">🤖</span> Open Chatbot
                    </Link>
                </div>
            </div>
    
            {/* Main Content */}
            <div className="sm:w-full md:w-2/3 lg:w-3/4 ml-auto p-6 h-screen overflow-y-auto relative">
  {/* ProfileMenu in top-right */}
  <div className="absolute top-6 right-6">
    <ProfileMenu />
  </div>

  {/* Main Content */}
  <h2 className="text-3xl font-bold mb-6 text-teal-800">Document Interface</h2>
    
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setShowQuestionSection(false)}
                        className={`px-4 py-2 rounded-t-lg transition-colors ${
                            !showQuestionSection ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-800 hover:bg-teal-200"
                        }`}
                    >
                        📄 Doc Analyzer
                    </button>
                    <button
                        onClick={() => setShowQuestionSection(true)}
                        className={`px-4 py-2 rounded-t-lg transition-colors ${
                            showQuestionSection ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-800 hover:bg-teal-200"
                        }`}
                    >
                        💬 Ask a Question
                    </button>
                </div>
    
                {!showQuestionSection && explanation && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-teal-200">
                        <h3 className="text-xl font-semibold text-teal-800">Document Explanation</h3>
                        <div className="mt-3 text-gray-700 whitespace-pre-wrap text-left p-4 bg-[#F0F8F8] rounded-lg border-l-4 border-teal-500">
                            {explanation}
                        </div>
                    </div>
                )}
    
                {showQuestionSection && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-teal-200">
                        <h3 className="text-xl font-semibold mb-3 text-teal-800">Ask a Question</h3>
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-[#F0F8F8] text-gray-800 p-3 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={handleAsk}
                            className={`bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg mt-3 w-full transition-all shadow-sm ${
                                processingQuestion ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={processingQuestion}
                        >
                            {processingQuestion ? "Processing..." : "Get Answer"}
                        </button>
    
                        {answer && (
                            <div className="mt-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-teal-800">Answer:</h4>
                                <div className="mt-2 text-gray-700 whitespace-pre-wrap text-left p-4 bg-[#F0F8F8] rounded-lg border-l-4 border-teal-500">
                                    {answer}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocAnalyzer;
