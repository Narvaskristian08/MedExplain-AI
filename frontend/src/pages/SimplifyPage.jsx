// src/pages/SimplifyPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import UploadIcon from "../assets/upload.svg";
import api from "../services/api"; // ← CHANGED: Use api, not apiService
import { FaSpinner, FaHistory } from "react-icons/fa";

const SimplifyPage = ({ user, onLogout }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(
      `SimplifyPage render count: ${renderCount.current}, Location: ${location.pathname}, User:`,
      user
    );
    if (user && !localStorage.getItem("token")) {
      setError("Session token missing. Please log in again.");
    } else if (!user && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      setError("Session expired. Please log in again.");
    }
  }, [navigate, user, location.pathname]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Unsupported file type. Please upload a PDF or DOC/DOCX file.");
        setFile(null);
      } else {
        console.log("File selected:", selectedFile.name, "Type:", selectedFile.type, "Size:", selectedFile.size);
      }
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    console.log("Text updated:", newText);
    setError("");
  };

  const handleSubmit = async (data, inputType) => {
    // ---------- validation ----------
    if (inputType === "text" && !data.trim()) {
      setError("Please enter text to simplify.");
      return;
    }
    if (inputType === "file" && !data) {
      setError("Please upload a file to simplify.");
      return;
    }

    setIsLoading(true);
    setShowModal(true);

    const token = localStorage.getItem("token");
    const isGuest = !token;

    console.log("=== SUBMIT DEBUG ===");
    console.log("Token exists:", !!token);
    console.log("Token value:", token ? `${token.substring(0, 30)}...` : "none");
    console.log("User state:", user);
    console.log("Mode:", isGuest ? "GUEST" : "AUTHENTICATED");
    console.log("Input type:", inputType);

    try {
      const formData = new FormData();
      if (inputType === "text") {
        formData.append("text", data);
        formData.append("inputType", "text");
      } else {
        formData.append("file", data);
        formData.append(
          "inputType",
          data.type.includes("pdf") ? "pdf" : "doc"
        );
      }

      console.log("[Frontend] Sending request to /llm/simplify");

      // ← CHANGED: Use api.post() → triggers interceptor
      const response = await api.post("/llm/simplify", formData);

      console.log("[Frontend] Response received:", response.data);
      const simplifiedText = response.data.simplified;

      navigate("/result", {
        state: {
          originalText: inputType === "text" ? data : data.name,
          simplifiedText,
        },
      });
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error || err.message || "Request failed";
      setError(`Error: ${errorMsg}`);

      if (err.response?.status === 401 && token) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        onLogout?.();
      }
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    handleSubmit(text, "text");
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    handleSubmit(file, "file");
  };

  const handleHistoryClick = () => {
    if (!user) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
    } else {
      navigate("/history");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100 pt-20">
      <Header user={user} onLogout={onLogout} />
      
      <div className="flex flex-col items-center justify-center p-6 space-y-8 w-full">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simplify Medical Documents
          </h1>
          <p className="font-sans mt-4 text-xl text-gray-600">
            {user 
              ? `Logged in as ${user.name || user.email || user.id}` 
              : "Upload or paste medical notes to simplify—no login required!"
            }
          </p>

          {/* History Button */}
          <div className="mt-6">
            <button
              onClick={handleHistoryClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaHistory className="text-lg" />
              <span className="font-semibold">View History</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
          <div className="bg-white rounded-[30px] shadow-xl flex flex-col items-center p-8 min-h-[500px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Add Docs
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Upload PDF or DOC files to simplify (text will be extracted).
            </p>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-[30px] p-12 w-full max-w-md cursor-pointer hover:bg-blue-50 transition relative">
                <img src={UploadIcon} alt="Upload Icon" className="w-16 h-16 mb-4" />
                <p className="text-gray-500 mb-2 text-center">Drag & drop your PDF or DOC here</p>
                <p className="text-gray-400 text-sm mb-4 text-center">or</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  name="file"
                />
                <label
                  htmlFor="fileInput"
                  className="px-6 py-3 bg-blue-600 text-white rounded-[30px] cursor-pointer hover:bg-blue-700 w-full max-w-md text-center"
                >
                  Browse Files
                </label>
              </div>
              {file && <p className="mt-4 text-green-600 font-medium">{file.name} selected</p>}
              <button
                type="button"
                onClick={handleFileSubmit}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-[30px] hover:bg-blue-700 w-full max-w-md disabled:bg-gray-400"
                disabled={isLoading || !file}
              >
                {isLoading ? "Processing..." : "Process File"}
              </button>
              {error && <p className="mt-2 text-red-600 font-medium">{error}</p>}
            </div>
          </div>

          <div className="bg-white rounded-[30px] shadow-xl flex flex-col items-center p-8 min-h-[500px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Add Text
            </h2>
            <p className="font-sans text-gray-500 text-center mb-4">
              Paste your medical notes here to simplify them directly.
            </p>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Text will appear here..."
              className="resize-none border border-gray-300 rounded-[30px] p-4 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
            ></textarea>
            <button
              type="button"
              onClick={handleTextSubmit}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-[30px] hover:bg-blue-700 w-full max-w-md disabled:bg-gray-400"
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? "Processing..." : "Process Text"}
            </button>
            {error && <p className="mt-2 text-red-600 font-medium">{error}</p>}
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
            <p className="text-gray-700">Processing your document...</p>
          </div>
        </div>
      )}

      {/* Login Alert Modal */}
      {showLoginAlert && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold">Please log in first to view your history!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifyPage;