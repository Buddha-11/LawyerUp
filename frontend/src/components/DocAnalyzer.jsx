import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { db } from "../context/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import Navbar from "./Navbar";
import { FileText, MessageSquare, Upload, ChevronRight } from "lucide-react";

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
    if (!user) { setError("⚠️ User not logged in."); return; }
    const data = { fileName, language, explanation, question, answer, timestamp: serverTimestamp() };
    try {
      const docId = `${fileName}_${Date.now()}`;
      await setDoc(doc(db, "users", user.uid, "documents", docId), data);
    } catch (err) {
      console.error("Error saving:", err);
      setError("Error saving to database.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError("⚠️ Please select a file first!"); return; }
    const formData = new FormData();
    formData.append("pdfs", selectedFile);
    setUploading(true);
    setExplanation("");
    setShowQuestionSection(false);
    try {
      await axios.post("https://ai-doc-analyzer-1030063559705.asia-south1.run.app/upload", formData);
      const response = await axios.get(`https://ai-doc-analyzer-1030063559705.asia-south1.run.app/explain?language=${language}`);
      setExplanation(response.data.explanation);
      localStorage.setItem("explanation", response.data.explanation);
      await saveToFirestore();
    } catch (error) {
      console.error("Error uploading:", error);
      setError("❌ Failed to process document.");
    }
    setUploading(false);
  };

  const handleAsk = async () => {
    if (!question.trim()) { setError("⚠️ Enter a valid question!"); return; }
    setProcessingQuestion(true);
    setAnswer("⏳ Generating answer...");
    setError(null);
    try {
      const response = await axios.post("https://ai-doc-analyzer-1030063559705.asia-south1.run.app/ask", { question });
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
    <div className="flex flex-col h-screen bg-[#F0F8F8]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 lg:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-100 shadow-sm flex flex-col md:h-full flex-shrink-0">
          <div className="p-4 md:p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Legal Doc AI</h2>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Output Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 text-sm p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Upload Document
              </label>
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
                className={`w-full flex items-center gap-2 text-sm p-2.5 rounded-lg cursor-pointer border-2 border-dashed transition-all ${
                  fileName
                    ? "border-teal-300 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                <Upload size={14} className="flex-shrink-0" />
                <span className="truncate">{fileName || "Choose PDF file"}</span>
              </label>
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg mb-3">{error}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className={`w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm ${
                (uploading || !selectedFile) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : "Analyse Document"}
            </button>
          </div>

          <div className="p-4 md:mt-auto">
            <Link
              to="/chat"
              className="flex items-center justify-between bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-all border border-gray-200 hover:border-teal-200"
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={14} />
                Open AI Chatbot
              </span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Document Analysis</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setShowQuestionSection(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !showQuestionSection
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                📄 Analyse
              </button>
              <button
                onClick={() => setShowQuestionSection(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showQuestionSection
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                💬 Ask a Question
              </button>
            </div>

            {/* Analysis tab */}
            {!showQuestionSection && (
              explanation ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-teal-600" />
                    <h3 className="text-base font-semibold text-gray-800">Document Explanation</h3>
                  </div>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                    {explanation}
                  </div>
                  <button
                    onClick={() => setShowQuestionSection(true)}
                    className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    Ask a question about this document <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                    <FileText size={28} className="text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Document Analysed Yet</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Upload a PDF document from the sidebar and click "Analyse Document" to get started.
                  </p>
                </div>
              )
            )}

            {/* Question tab */}
            {showQuestionSection && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Ask About Your Document</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. What are my rights under this contract?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    className="flex-1 bg-gray-50 text-gray-800 text-sm p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAsk}
                    disabled={processingQuestion || !question.trim()}
                    className={`bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-all shadow-sm ${
                      (processingQuestion || !question.trim()) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {processingQuestion ? "..." : "Ask"}
                  </button>
                </div>

                {answer && (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-700">Answer</span>
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                      {answer}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocAnalyzer;
