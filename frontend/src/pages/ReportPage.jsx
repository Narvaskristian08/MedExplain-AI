import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import SideNav from "../components/dashboard/Sidebar";
import UserInfo from "../components/dashboard/UserInfo";
import { FaSpinner, FaFileCsv, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const ReportPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await apiService.get("/llm/report");
        console.log("Report data received:", response.data);
        setReportData(response.data);
      } catch (err) {
        console.error("Report fetch error:", err);
        setError(`Failed to load report: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReport();
  }, [user]);

  // Top misunderstood term
  const topMisunderstoodTerm = reportData?.topMisunderstood?.reduce(
    (max, item) => (item.misunderstood || 0) > (max.misunderstood || 0) ? item : max,
    reportData?.topMisunderstood?.[0] || {}
  );

  // EXPORT TO CSV
  const handleExportCSV = () => {
    if (!reportData?.topMisunderstood?.length) {
      alert("No data to export");
      return;
    }

    const headers = ["Term", "Usage Count", "Simplicity Score", "Misunderstood", "Usage Instructions", "Last Updated"];
    const rows = reportData.topMisunderstood.map((item) => [
      `"${item.term}"`,
      item.usagecount || 0,
      (item.simpScore || 0).toFixed(2),
      item.misunderstood || 0,
      item.usageInstr || 0,
      item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A",
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // EXPORT TO XLSX (Excel)
  const handleExportXLSX = () => {
    if (!reportData?.topMisunderstood?.length) {
      alert("No data to export");
      return;
    }

    const data = reportData.topMisunderstood.map(item => ({
      Term: item.term,
      "Usage Count": item.usagecount || 0,
      "Simplicity Score": (item.simpScore || 0).toFixed(2),
      Misunderstood: item.misunderstood || 0,
      "Usage Instructions": item.usageInstr || 0,
      "Last Updated": item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");

    // Auto-size columns
    ws['!cols'] = [
      { wch: 20 }, // Term
      { wch: 12 }, // Usage Count
      { wch: 15 }, // Simplicity Score
      { wch: 14 }, // Misunderstood
      { wch: 18 }, // Usage Instructions
      { wch: 20 }, // Last Updated
    ];

    const fileName = `analytics_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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

        {/* Overview Stats */}
        {reportData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <h3 className="text-gray-600 text-sm sm:text-base font-medium">Total Queries</h3>
              <p className="text-3xl sm:text-4xl font-bold text-blue-700 mt-2">
                {reportData.totalQueries || 0}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <h3 className="text-gray-600 text-sm sm:text-base font-medium">Tracked Terms</h3>
              <p className="text-3xl sm:text-4xl font-bold text-blue-700 mt-2">
                {reportData.topMisunderstood?.length || 0}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <h3 className="text-gray-600 text-sm sm:text-base font-medium">Top Misunderstood</h3>
              <p className="text-lg sm:text-xl font-bold text-red-600 mt-1 truncate">
                {topMisunderstoodTerm?.term || "N/A"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {topMisunderstoodTerm?.misunderstood || 0} times
              </p>
            </div>
          </div>
        )}

        {/* Analytics Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Term Analytics</h2>
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
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Usage Instr</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.topMisunderstood?.length > 0 ? (
                    reportData.topMisunderstood.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{item.term}</td>
                        <td className="px-3 py-3 text-gray-700">{item.usagecount || 0}</td>
                        <td className="px-3 py-3 text-gray-700">{(item.simpScore || 0).toFixed(2)}</td>
                        <td className="px-3 py-3 text-gray-700">{item.misunderstood || 0}</td>
                        <td className="px-3 py-3 text-gray-700">{item.usageInstr || 0}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">
                          {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                        No analytics data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={handleExportCSV}
            disabled={!reportData?.topMisunderstood?.length}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <FaFileCsv />
            Export CSV
          </button>

          <button
            onClick={handleExportXLSX}
            disabled={!reportData?.topMisunderstood?.length}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            onClick={() => navigate("/simplify")}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Back to Simplify
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;