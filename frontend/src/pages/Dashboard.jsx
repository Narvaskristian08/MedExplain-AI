import React, { useEffect, useState } from "react";
import SideNav from "../components/dashboard/Sidebar";
import UserInfo from "../components/dashboard/UserInfo";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ user, onLogout }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------------------------------------------
  // 1. FETCH REPORT
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token") || user?.token;
        const res = await fetch("http://localhost:4000/api/llm/report", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Received report:", data);
        setReport(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user]);

  // -------------------------------------------------------------
  // 2. SORTED DATA
  // -------------------------------------------------------------
  const sortedTerms = React.useMemo(() => {
    if (!report?.allTerms) return [];
    return [...report.allTerms].sort((a, b) => 
      (b.usagecount || 0) * (b.misunderstood || 0) - (a.usagecount || 0) * (a.misunderstood || 0)
    );
  }, [report?.allTerms]);

  const topMisunderstood = sortedTerms.filter(t => t.misunderstood === 1).slice(0, 8);
  const topUsage = sortedTerms.slice(0, 8);

  // -------------------------------------------------------------
  // 3. EXPORT
  // -------------------------------------------------------------
  const exportCSV = () => {
    if (!sortedTerms.length) return alert("No data to export");
    const headers = ["Term", "Usage", "Score", "Misunderstood", "Instructions", "Last Updated"];
    const rows = sortedTerms.map(t => [
      `"${t.term}"`,
      t.usagecount || 0,
      (t.simpScore || 0).toFixed(2),
      t.misunderstood || 0,
      t.usageInstr || 0,
      t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    if (!sortedTerms.length) return alert("No data to export");
    const data = sortedTerms.map(t => ({
      Term: t.term,
      "Usage Count": t.usagecount || 0,
      "Simplicity Score": (t.simpScore || 0).toFixed(2),
      Misunderstood: t.misunderstood || 0,
      "Usage Instructions": t.usageInstr || 0,
      "Last Updated": t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
    const fileName = `analytics_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // -------------------------------------------------------------
  // 4. CHART DATA
  // -------------------------------------------------------------
  const topUsageData = {
    labels: topUsage.map(t => t.term),
    datasets: [
      {
        label: "Usage Count",
        data: topUsage.map(t => t.usagecount || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Misunderstood",
        data: topUsage.map(t => t.misunderstood || 0),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  const complexityData = {
    labels: ["0-2", "2-4", "4-6", "6-8", "8-10"],
    datasets: [
      {
        label: "Understood Terms",
        data: [
          sortedTerms.filter(t => (t.simpScore || 0) <= 2 && t.misunderstood === 0).length,
          sortedTerms.filter(t => t.simpScore > 2 && t.simpScore <= 4 && t.misunderstood === 0).length,
          sortedTerms.filter(t => t.simpScore > 4 && t.simpScore <= 6 && t.misunderstood === 0).length,
          sortedTerms.filter(t => t.simpScore > 6 && t.simpScore <= 8 && t.misunderstood === 0).length,
          sortedTerms.filter(t => t.simpScore > 8 && t.misunderstood === 0).length,
        ],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
      {
        label: "Misunderstood Terms",
        data: [
          sortedTerms.filter(t => (t.simpScore || 0) <= 2 && t.misunderstood === 1).length,
          sortedTerms.filter(t => t.simpScore > 2 && t.simpScore <= 4 && t.misunderstood === 1).length,
          sortedTerms.filter(t => t.simpScore > 4 && t.simpScore <= 6 && t.misunderstood === 1).length,
          sortedTerms.filter(t => t.simpScore > 6 && t.simpScore <= 8 && t.misunderstood === 1).length,
          sortedTerms.filter(t => t.simpScore > 8 && t.misunderstood === 1).length,
        ],
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { padding: 20 } },
      tooltip: { 
        mode: "index", 
        intersect: false,
        callbacks: {
          afterLabel: ctx => `Score: ${(ctx.raw || 0).toFixed(1)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 11 } },
      },
    },
  };

  // -------------------------------------------------------------
  // 5. RENDER
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <SideNav onLogout={onLogout} />
      <UserInfo user={user} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-16 md:ml-64 transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Medical Term Analytics
        </h1>

        {/* ---------- SUMMARY ROW ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{report.totalQueries || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Queries</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-indigo-600">{report.totalTerms || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Terms Tracked</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-red-600">{report.misunderstoodCount || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Misunderstood</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{report.instrCount || 0}</div>
            <div className="text-sm text-gray-600 mt-1">With Instructions</div>
          </div>
        </div>

        {/* ---------- EXPORT BUTTONS ---------- */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition text-sm font-medium"
          >
            <FaFileCsv /> Export CSV
          </button>
          <button
            onClick={exportXLSX}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition text-sm font-medium"
          >
            <FaFileExcel /> Export Excel
          </button>
        </div>

        {/* ---------- TOP MISUNDERSTOOD TABLE ---------- */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Top Misunderstood Terms
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {topMisunderstood.length} terms
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Term</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Usage</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topMisunderstood.length ? (
                  topMisunderstood.map((t, i) => (
                    <tr key={t._id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{t.term}</td>
                      <td className="px-4 py-3">
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {t.usagecount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{(t.simpScore || 0).toFixed(1)}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No misunderstood terms yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- USAGE TRENDS CHART ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Usage */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Top Terms by Usage
            </h3>
            <div className="h-80">
              <Bar
                data={topUsageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: "top", 
                      labels: { padding: 20, usePointStyle: true } 
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { 
                        maxRotation: 45, 
                        minRotation: 45,
                        font: { size: 10 }
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                      ticks: { font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Complexity Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Misunderstanding by Complexity
            </h3>
            <div className="h-80">
              <Bar
                data={complexityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: "top", 
                      labels: { padding: 20, usePointStyle: true } 
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 11 } },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                      ticks: { font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* ---------- FULL DATA TABLE ---------- */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              All Tracked Terms ({sortedTerms.length})
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by usage
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Term</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Usage</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Misunderstood</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Instructions</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTerms.slice(0, 20).map((t, i) => (
                  <tr key={t._id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.term}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.usagecount > 5 ? "bg-blue-100 text-blue-800" : 
                        t.usagecount > 2 ? "bg-indigo-100 text-indigo-800" : 
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {t.usagecount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{(t.simpScore || 0).toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.misunderstood ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {t.misunderstood ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.usageInstr ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {t.usageInstr ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
                {sortedTerms.length > 20 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                      ... and {sortedTerms.length - 20} more terms
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;