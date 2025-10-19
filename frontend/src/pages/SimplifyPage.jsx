import React, { useState } from "react";
import Header from "../components/Header";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      {/* HEADER */}
      <Header user={user} onLogout={onLogout} />

      {/* MAIN CONTENT */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
          {/* LEFT — File Upload */}
          <div className="bg-white rounded-[30px] shadow-xl flex flex-col items-center justify-center p-10 min-h-[600px]">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Upload Your File
            </h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-12 w-full cursor-pointer hover:bg-blue-50 transition">
              <p className="text-gray-500 mb-2">
                Drag & drop your PDF or DOC here
              </p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
              >
                Browse Files
              </label>
            </div>

            {file && (
              <p className="mt-4 text-green-600 font-medium">{file.name} selected</p>
            )}
          </div>

          {/* RIGHT — Text Editor */}
          <div className="bg-white rounded-[30px] shadow-xl flex flex-col p-10 min-h-[600px]">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
              Text Output / Editor
            </h2>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Text will appear here..."
              className="flex-1 resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <button
              className="mt-4 self-end px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
