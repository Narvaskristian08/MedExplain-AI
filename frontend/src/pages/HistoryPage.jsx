import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { FaSpinner } from "react-icons/fa";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const HistoryPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIdx, setOpenIdx] = useState(null);

  /* ------------------------------------------------- */
  /* 1. FETCH USER'S OWN HISTORY */
  /* ------------------------------------------------- */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/llm/history");
        console.log("User history:", data);

        // Backend returns: { user, action, document, time, originalText, simplifiedText }
        const normalized = Array.isArray(data)
          ? data.map((entry) => ({
              user: entry.user ?? "You",
              action: entry.action ?? "Simplified",
              document: entry.document ?? "",
              time: entry.time ?? "",
              originalText: entry.originalText ?? "",
              simplifiedText: entry.simplifiedText ?? "",
            }))
          : [];

        setHistory(normalized);
      } catch (err) {
        console.error(err);
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
        setError(`Failed to load your history: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  /* ------------------------------------------------- */
  /* 2. TOGGLE ACCORDION */
  /* ------------------------------------------------- */
  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  /* ------------------------------------------------- */
  /* 3. RENDER */
  /* ------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100">
        <FaSpinner className="animate-spin text-3xl text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <Header user={user} onLogout={onLogout} />

      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 pt-24 sm:pt-28">
        <div className="max-w-7xl mx-auto space-y-6">

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
            My Simplification History
          </h1>

          {/* ----- ERROR ----- */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* ----- EMPTY ----- */}
          {history.length === 0 && !error && (
            <div className="bg-white rounded-2xl sm:rounded-[30px] shadow-sm p-8 sm:p-12 text-center">
              <p className="text-gray-600 text-base sm:text-lg mb-4">
                You haven't simplified anything yet.
              </p>
              <button
                onClick={() => navigate("/simplify")}
                className="px-6 py-3 bg-blue-600 text-white rounded-full sm:rounded-[30px] hover:bg-blue-700 transition text-sm sm:text-base"
              >
                Start Simplifying
              </button>
            </div>
          )}

          {/* ----- LIST ----- */}
          {history.length > 0 && (
            <>
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  Total Records: <span className="font-semibold text-blue-600">{history.length}</span>
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl sm:rounded-[30px] shadow-md sm:shadow-xl border border-gray-200 overflow-hidden"
                  >
                    {/* ----- HEADER ----- */}
                    <button
                      onClick={() => toggle(idx)}
                      className="w-full p-3 sm:p-4 lg:p-5 flex justify-between items-center text-left bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                          {entry.time}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm text-gray-600">
                            {entry.action}
                          </span>
                          {entry.document && (
                            <span className="px-2 py-0.5 sm:py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium truncate max-w-[200px]">
                              {entry.document}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-5 h-5 text-gray-600">
                        {openIdx === idx ? (
                          <ChevronUpIcon className="w-full h-full" />
                        ) : (
                          <ChevronDownIcon className="w-full h-full" />
                        )}
                      </div>
                    </button>

                    {/* ----- CONTENT: Always show original + simplified ----- */}
                    {openIdx === idx && (
                      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                          {/* ORIGINAL */}
                          <div className="bg-white rounded-xl sm:rounded-[20px] shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6">
                            <div className="sticky top-0 bg-white pb-2 sm:pb-3 border-b border-gray-200 mb-3 sm:mb-4 z-10">
                              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 text-center">
                                Original Text
                              </h2>
                            </div>
                            <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                              <p className="text-gray-700 text-xs sm:text-sm lg:text-base whitespace-pre-wrap leading-relaxed">
                                {entry.originalText || "No original text"}
                              </p>
                            </div>
                          </div>

                          {/* SIMPLIFIED */}
                          <div className="bg-white rounded-xl sm:rounded-[20px] shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6">
                            <div className="sticky top-0 bg-white pb-2 sm:pb-3 border-b border-gray-200 mb-3 sm:mb-4 z-10">
                              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 text-center">
                                Simplified Text
                              </h2>
                            </div>
                            <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                              <p className="text-gray-700 text-xs sm:text-sm lg:text-base whitespace-pre-wrap leading-relaxed">
                                {entry.simplifiedText || "No simplified text"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4 sm:pt-6">
                <button
                  onClick={() => navigate("/simplify")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full sm:rounded-[30px] hover:bg-blue-700 transition text-sm sm:text-base shadow-md hover:shadow-lg"
                >
                  Back to Simplify
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;