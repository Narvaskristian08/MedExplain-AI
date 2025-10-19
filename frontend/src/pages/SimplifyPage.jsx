import React, { useState } from "react";
import Header from "../components/Header";
import UploadIcon from "../assets/upload.svg"; // normal image import

const SimplifyPage = ({ user, onLogout }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100 pt-20">
      <Header user={user} onLogout={onLogout} />

      <div className="flex flex-col items-center justify-center p-6 space-y-8 w-full">
        {/* Page Title */}
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simplify Medical Documents
          </h1>
          <p className="font-sans mt-4 text-xl text-gray-600">
            Upload your files or paste your medical notes to get clear, easy-to-understand explanations instantly.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
          {/* File Upload */}
          <div className="bg-white rounded-[30px] shadow-xl flex flex-col items-center p-8 min-h-[500px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Add Docs
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Upload PDF or DOC files to simplify your medical documents.
            </p>

            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-[30px] p-12 w-full max-w-md cursor-pointer hover:bg-blue-50 transition relative">
                {/* SVG Icon as image */}
                <img src={UploadIcon} alt="Upload Icon" className="w-16 h-16 mb-4" />

                <p className="text-gray-500 mb-2 text-center">Drag & drop your PDF or DOC here</p>
                <p className="text-gray-400 text-sm mb-4 text-center">or</p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="fileInput"
                  className="px-6 py-3 bg-blue-600 text-white rounded-[30px] cursor-pointer hover:bg-blue-700 w-full max-w-md text-center"
                >
                  Browse Files
                </label>
              </div>

              {file && (
                <p className="mt-4 text-green-600 font-medium">{file.name} selected</p>
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white rounded-[30px] shadow-xl flex flex-col items-center p-8 min-h-[500px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Add Text
            </h2>
            <p className="text-gray-500 text-center mb-4">
              Paste your medical notes here to simplify them quickly.
            </p>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Text will appear here..."
              className="resize-none border border-gray-300 rounded-[30px] p-4 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
            ></textarea>
            <button
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-[30px] hover:bg-blue-700 w-full max-w-md"
              onClick={() => alert("Text processed!")}
            >
              Process
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifyPage;
