import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { firebaseAuth } from "../context/firebase";
import Navbar from "./Navbar";
import {
  Upload,
  Search,
  BarChart2,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  FileText,
  Newspaper,
} from "lucide-react";

// UploadCaseFile: uploads a PDF to the Flask backend /api/v1/upload-case-file
// Three-step workflow UI: Upload → Search → Analyze
export default function UploadCaseFile() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("upload"); // upload | search | analyze

  // SEARCH state
  const [daysBack, setDaysBack] = useState(7);
  const [maxResults, setMaxResults] = useState(20);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // ANALYZE state
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
        } catch (err) {
          console.error("Failed to get ID token:", err);
          setError("Failed to authenticate. Please sign in again.");
        }
      } else {
        setIdToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const onFileChange = (e) => {
    setError(null);
    const f = e.target.files?.[0] || null;
    if (f && f.name && f.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(f);
    } else if (f) {
      setError("Only PDF files are supported.");
      setSelectedFile(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      if (!f.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        return;
      }
      setSelectedFile(f);
      setError(null);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploadResult(null);
    setError(null);
    setSearchResults([]);
    setSelectedArticles([]);
    setAnalysisResult(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const uploadFile = async () => {
    setError(null);
    setUploadResult(null);

    if (!idToken) {
      setError("You must be signed in to upload a case file.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a PDF to upload.");
      return;
    }

    const form = new FormData();
    form.append("file", selectedFile);

    try {
      setUploading(true);
      setProgress(0);

      const resp = await axios.post(
        "https://proactive-agent-1030063559705.asia-south1.run.app/api/v1/upload-case-file",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
          onUploadProgress: (evt) => {
            if (evt.total) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              setProgress(pct);
            }
          },
          timeout: 180000,
        }
      );

      setUploadResult(resp.data || null);
      setStep("search");
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const searchArticles = async () => {
    setError(null);
    setSearchResults([]);

    if (!idToken) {
      setError("You must be signed in to search articles.");
      return;
    }

    try {
      setSearching(true);
      const resp = await axios.post(
        "https://proactive-agent-1030063559705.asia-south1.run.app/api/v1/search-articles",
        { days_back: Number(daysBack), max_results: Number(maxResults) },
        { headers: { Authorization: `Bearer ${idToken}` }, timeout: 120000 }
      );

      setSearchResults(resp.data.articles || []);
      setStep("analyze");
    } catch (err) {
      console.error("Search error:", err);
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const toggleArticleSelection = (idx) => {
    setSelectedArticles((prev) => {
      const exists = prev.includes(idx);
      if (exists) return prev.filter((i) => i !== idx);
      return [...prev, idx];
    });
  };

  const analyzeArticles = async () => {
    setError(null);
    setAnalysisResult(null);

    if (!idToken) {
      setError("You must be signed in to analyze articles.");
      return;
    }

    const articlesPayload = selectedArticles.length
      ? selectedArticles.map((i) => searchResults[i])
      : searchResults.slice(0, 10);

    if (articlesPayload.length === 0) {
      setError("No articles to analyze. Run a search first.");
      return;
    }

    try {
      setAnalyzing(true);
      const resp = await axios.post(
        "https://proactive-agent-1030063559705.asia-south1.run.app/api/v1/analyze-articles",
        { articles: articlesPayload },
        { headers: { Authorization: `Bearer ${idToken}` }, timeout: 300000 }
      );

      setAnalysisResult(resp.data || null);
    } catch (err) {
      console.error("Analyze error:", err);
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Step indicator component
  const steps = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "search", label: "Search", icon: Search },
    { id: "analyze", label: "Analyze", icon: BarChart2 },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="flex flex-col h-screen bg-[#F0F8F8]">
      <Navbar />

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 lg:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-100 shadow-sm flex flex-col flex-shrink-0">
          <div className="p-4 md:p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Case Monitor
              </h2>
            </div>

            {/* Progress Steps */}
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isDone = i < stepIndex;
                const isCurrent = i === stepIndex;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : isDone
                        ? "text-teal-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-teal-600 text-white"
                          : isDone
                          ? "bg-teal-100 text-teal-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Icon size={13} />
                      )}
                    </div>
                    <span>{s.label}</span>
                    {isCurrent && (
                      <ChevronRight size={14} className="ml-auto text-teal-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset Button */}
          <div className="p-4">
            <button
              onClick={clearAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all"
            >
              <RefreshCcw size={14} />
              Reset &amp; Start Over
            </button>
          </div>

          {/* Info */}
          <div className="mt-auto p-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload a PDF case file. The system will extract legal entities,
              search relevant news, and generate smart alerts.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800">
                Case File Monitor
              </h1>
              {uploadResult && (
                <span className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full font-medium">
                  <CheckCircle size={12} />
                  File uploaded successfully
                </span>
              )}
            </div>

            {/* ── STEP: Upload ── */}
            {step === "upload" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Upload size={18} className="text-teal-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Upload Case Document
                  </h2>
                </div>

                {/* Drop Zone */}
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-teal-400 bg-teal-50"
                      : selectedFile
                      ? "border-teal-300 bg-teal-50"
                      : "border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={onFileChange}
                  />

                  {!selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center border-2 border-dashed border-teal-200">
                        <Upload size={24} className="text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Drop your PDF here, or{" "}
                          <span className="text-teal-600">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Only PDF files are supported · Max 50 MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <FileText size={22} className="text-teal-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ·
                        Click to change
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-full bg-teal-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={uploadFile}
                    disabled={uploading || !selectedFile}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm ${
                      uploading || !selectedFile
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        Upload PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: Search (visible in search & analyze steps) ── */}
            {(step === "search" || step === "analyze") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <Search size={18} className="text-teal-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Search Relevant Articles
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-5">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Days back
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={daysBack}
                      onChange={(e) => setDaysBack(Number(e.target.value))}
                      className="w-full bg-gray-50 text-gray-800 text-sm p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Max results
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={maxResults}
                      onChange={(e) => setMaxResults(Number(e.target.value))}
                      className="w-full bg-gray-50 text-gray-800 text-sm p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={searchArticles}
                    disabled={searching}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm ${
                      searching ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {searching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Searching…
                      </>
                    ) : (
                      <>
                        <Search size={15} />
                        Search Articles
                      </>
                    )}
                  </button>
                </div>

                {error && step === "search" && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Newspaper size={15} className="text-teal-500" />
                        {searchResults.length} Articles Found
                      </h3>
                      <span className="text-xs text-gray-400">
                        Select articles to include in analysis
                      </span>
                    </div>

                    <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
                      {searchResults.map((a, i) => (
                        <label
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedArticles.includes(i)
                              ? "border-teal-300 bg-teal-50"
                              : "border-gray-100 bg-gray-50 hover:border-teal-200 hover:bg-teal-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedArticles.includes(i)}
                            onChange={() => toggleArticleSelection(i)}
                            className="mt-1 accent-teal-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {a.title}
                            </p>
                            {a.snippet && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {a.snippet}
                              </p>
                            )}
                            {a.link && (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1 font-medium"
                              >
                                Open <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: Analyze ── */}
            {step === "analyze" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={18} className="text-teal-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Analyze Selected Articles
                  </h2>
                </div>

                {selectedArticles.length > 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    {selectedArticles.length} article
                    {selectedArticles.length !== 1 ? "s" : ""} selected · 
                    analyzing against your uploaded case file.
                  </p>
                )}

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={analyzeArticles}
                    disabled={analyzing}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm ${
                      analyzing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <BarChart2 size={15} />
                        Analyze Articles
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStep("search");
                      setAnalysisResult(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Back to Search
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 mb-4">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="mt-2 p-5 bg-teal-50 border border-teal-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={18} className="text-teal-600" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Analysis Complete
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-teal-100 text-center">
                        <p className="text-2xl font-bold text-teal-600">
                          {analysisResult.articles_analyzed ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Articles Analyzed
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-teal-100 text-center">
                        <p className="text-2xl font-bold text-teal-600">
                          {analysisResult.alerts_created ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Alerts Created
                        </p>
                      </div>
                    </div>

                    {Array.isArray(analysisResult.alerts) &&
                      analysisResult.alerts.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Generated Alerts
                          </h4>
                          <ul className="space-y-2">
                            {analysisResult.alerts.map((al, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 bg-white rounded-lg p-3 border border-teal-100 text-sm"
                              >
                                <span className="mt-0.5">
                                  <AlertCircle
                                    size={14}
                                    className="text-teal-500"
                                  />
                                </span>
                                <span className="flex-1 text-gray-700">
                                  {al.title}
                                </span>
                                {al.priority && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {al.priority}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {analysisResult.message && (
                      <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                        {analysisResult.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="mt-6 text-center text-xs text-gray-400">
              Files are processed securely. Make sure you are signed in before
              uploading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}