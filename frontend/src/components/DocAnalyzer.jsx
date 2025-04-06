import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
            setAnswer(response.data.answer || "No response received.");
            localStorage.setItem("answer", response.data.answer || "No response received.");
        } catch (error) {
            console.error("Error fetching answer:", error);
            setAnswer("❌ Error fetching answer.");
        }
        setProcessingQuestion(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="sm:w-full md:w-1/3 lg:w-1/4 bg-gray-800 p-6 fixed md:relative h-full flex flex-col justify-between">
                {/* Top Part */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Legal Doc AI</h2>

                    {/* Language Selection */}
                    <label className="text-lg">Choose Language:</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-gray-700 text-white p-2 rounded-lg mt-2"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Marathi">Marathi</option>
                    </select>

                    {/* File Upload */}
                    <div className="mt-6">
                        <label className="text-lg">Upload PDF:</label>
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
                            className="w-full bg-gray-700 text-white p-2 rounded-lg mt-2 cursor-pointer text-center block"
                        >
                            {fileName ? `📄 ${fileName}` : "Choose File"}
                        </label>
                        <button
                            onClick={handleUpload}
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full transition-all ${
                                uploading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Submit & Process"}
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>

                {/* Bottom Chatbot Link */}
                <div className="mt-8">
                    <Link
                        to="/chat"
                        className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
                    >
                        <span className="mr-2 text-xl">🤖</span> Open Chatbot
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="sm:w-full md:w-2/3 lg:w-3/4 ml-auto p-6 h-screen overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6">Document Interface</h2>

                {/* Tab Switcher */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setShowQuestionSection(false)}
                        className={`px-4 py-2 rounded-t-lg ${
                            !showQuestionSection ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                        }`}
                    >
                        📄 Doc Analyzer
                    </button>
                    <button
                        onClick={() => setShowQuestionSection(true)}
                        className={`px-4 py-2 rounded-t-lg ${
                            showQuestionSection ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                        }`}
                    >
                        💬 Ask a Question
                    </button>
                </div>

                {/* Doc Analyzer View */}
                {!showQuestionSection && explanation && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold">Document Explanation</h3>
                        <p className="mt-2 text-gray-300 whitespace-pre-wrap text-left">{explanation}</p>
                    </div>
                )}

                {/* Question Section */}
                {showQuestionSection && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-3">Ask a Question</h3>
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none"
                        />
                        <button
                            onClick={handleAsk}
                            className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg mt-3 w-full transition-all ${
                                processingQuestion ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={processingQuestion}
                        >
                            {processingQuestion ? "Processing..." : "Get Answer"}
                        </button>

                        {answer && (
                            <div className="bg-gray-700 p-4 mt-4 rounded-lg">
                                <h4 className="text-lg font-semibold">Answer:</h4>
                                <p className="mt-2 text-gray-300 whitespace-pre-wrap text-left">{answer}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocAnalyzer;
