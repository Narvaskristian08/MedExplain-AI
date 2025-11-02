// ------------------------------------------------------------
// ReportPage.jsx – uses **allTerms** for table + export
// ------------------------------------------------------------
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SideNav from "../components/dashboard/Sidebar";
import UserInfo from "../components/dashboard/UserInfo";
import { FaSpinner, FaFileCsv, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const ReportPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------------------------------------------
  // 1. Fetch the full report
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/llm/report");
        setReport(data);
      } catch (err) {
        console.error("Report fetch error:", err);
        setError(`Failed to load report: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchReport();
  }, [user]);

  // -------------------------------------------------------------
  // 2. Export helpers (use **allTerms**)
  // -------------------------------------------------------------
  const exportCSV = () => {
    if (!report?.allTerms?.length) return alert("No data to export");
    const headers = [
      "Term", "Usage Count", "Simplicity Score",
      "Misunderstood", "Usage Instructions", "Last Updated"
    ];
    const rows = report.allTerms.map(t => [
      `"${t.term}"`,
      t.usagecount || 0,
      (t.simpScore || 0).toFixed(2),
      t.misunderstood || 0,
      t.usageInstr || 0,
      t.timestamp ? new Date(t.timestamp).toLocaleString() : "N/A"
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    if (!report?.allTerms?.length) return alert("No data to export");
    const data = report.allTerms.map(t => ({
      Term: t.term,
      "Usage Count": t.usagecount || 0,
      "Simplicity Score": (t.simpScore || 0).toFixed(2),
      Misunderstood: t.misunderstood || 0,
      "Usage Instructions": t.usageInstr || 0,
      "Last Updated": t.timestamp ? new Date(t.timestamp).toLocaleString() : "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    ws["!cols"] = [
      { wch: 25 }, { wch: 12 }, { wch: 15 },
      { wch: 14 }, { wch: 18 }, { wch: 22 }
    ];
    const fileName = `analytics_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // -------------------------------------------------------------
  // 3. Render
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <SideNav onLogout={onLogout} />
      <UserInfo user={user} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full md:ml-64 pt-20">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-6">
          Analytics Report
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* ---- Summary Cards ---- */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 text-center hover:scale-105 transition">
              <h3 className="text-gray-600 text-sm font-medium">Total Queries</h3>
              <p className="text-3xl font-bold text-blue-700 mt-2">{report.totalQueries}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5 text-center hover:scale-105 transition">
              <h3 className="text-gray-600 text-sm font-medium">Tracked Terms</h3>
              <p className="text-3xl font-bold text-blue-700 mt-2">{report.totalTerms}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5 text-center hover:scale-105 transition">
              <h3 className="text-gray-600 text-sm font-medium">Misunderstood</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{report.misunderstoodCount}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5 text-center hover:scale-105 transition">
              <h3 className="text-gray-600 text-sm font-medium">With Instructions</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{report.instrCount}</p>
            </div>
          </div>
        )}

        {/* ---- Full Table ---- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              All Tracked Terms ({report?.allTerms?.length || 0})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                disabled={!report?.allTerms?.length}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <FaFileCsv /> CSV
              </button>
              <button
                onClick={exportXLSX}
                disabled={!report?.allTerms?.length}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-full text-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                <FaFileExcel /> Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Term</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Usage</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Simp Score</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Misunderstood</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Instr</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report?.allTerms?.length ? (
                    report.allTerms.map((t, i) => (
                      <tr key={t._id || i} className="hover:bg-blue-50 transition">
                        <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{t.term}</td>
                        <td className="px-3 py-3 text-gray-700">{t.usagecount}</td>
                        <td className="px-3 py-3 text-gray-700">{(t.simpScore || 0).toFixed(2)}</td>
                        <td className="px-3 py-3 text-gray-700">{t.misunderstood}</td>
                        <td className="px-3 py-3 text-gray-700">{t.usageInstr}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">
                          {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                        No data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ---- Back button ---- */}
        <div className="text-center">
          <button
            onClick={() => navigate("/simplify")}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition"
          >
            Back to Simplify
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;