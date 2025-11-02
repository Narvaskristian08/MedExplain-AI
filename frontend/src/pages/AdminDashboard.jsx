import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const AdminDashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    totalQueries: 0,
    totalTerms: 0,
    misunderstoodCount: 0,
    instrCount: 0,
    allTerms: [],
    top5Used: [],
    complexityData: [],
    docTypeBreakdown: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  // -------------------------------------------------------------
  // 1. FETCH DATA
  // -------------------------------------------------------------
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [reportRes, historyRes] = await Promise.all([
        fetch("http://localhost:4000/api/llm/report", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:4000/api/llm/history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const report = await reportRes.json();
      const history = await historyRes.json();

      // Sort by impact: usage × misunderstood
      const sortedTerms = [...(report.allTerms || [])].sort(
        (a, b) => (b.usagecount * b.misunderstood) - (a.usagecount * a.misunderstood)
      );

      // Top 5 most used for pie
      const top5Used = sortedTerms.slice(0, 5).map(t => ({
        name: t.term,
        value: t.usagecount || 0,
      }));

      // Complexity bins: % misunderstood per score range
      const bins = [
        { range: "0–2", min: 0, max: 2 },
        { range: "2–4", min: 2, max: 4 },
        { range: "4–6", min: 4, max: 6 },
        { range: "6–8", min: 6, max: 8 },
        { range: "8–10", min: 8, max: 10 },
      ];

      const complexityData = bins.map(bin => {
        const inRange = sortedTerms.filter(t =>
          (t.simpScore || 0) > bin.min && (t.simpScore || 0) <= bin.max
        );
        const total = inRange.length;
        const misunderstood = inRange.filter(t => t.misunderstood === 1).length;
        const percent = total > 0 ? (misunderstood / total) * 100 : 0;

        return {
          range: bin.range,
          total,
          misunderstood,
          understood: total - misunderstood,
          percent: Number(percent.toFixed(1)),
        };
      });

      setStats({
        totalQueries: report.totalQueries || 0,
        totalTerms: report.totalTerms || 0,
        misunderstoodCount: report.misunderstoodCount || 0,
        instrCount: report.instrCount || 0,
        allTerms: sortedTerms,
        top5Used,
        complexityData,
        docTypeBreakdown: report.docTypeBreakdown || [],
      });

      setRecentActivity(history);
    } catch (err) {
      console.error(err);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#F59E0B", "#6366F1"];

  const toggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);
  const displayedActivity = showAll ? recentActivity : recentActivity.slice(0, 5);

  // -------------------------------------------------------------
  // 2. EXPORT FULL DATA
  // -------------------------------------------------------------
  const exportCSV = () => {
    if (!stats.allTerms.length) return showToast("No data", "error");
    const headers = ["Term", "Usage", "Score", "Misunderstood", "Instructions", "Last Updated"];
    const rows = stats.allTerms.map(t => [
      `"${t.term}"`,
      t.usagecount || 0,
      (t.simpScore || 0).toFixed(2),
      t.misunderstood || 0,
      t.usageInstr || 0,
      t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    if (!stats.allTerms.length) return showToast("No data", "error");
    const data = stats.allTerms.map(t => ({
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
    XLSX.writeFile(wb, `admin_analytics_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // -------------------------------------------------------------
  // 3. DELETE TERM
  // -------------------------------------------------------------
  const confirmDelete = (term) => {
    setTermToDelete(term);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!termToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/llm/analytics/${encodeURIComponent(termToDelete)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast(`"${termToDelete}" deleted`, "success");
      await fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setTermToDelete(null);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // -------------------------------------------------------------
  // 4. RENDER
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
              Admin
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <p className="text-sm text-gray-600 font-medium">Total Queries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalQueries.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-600 font-medium">Tracked Terms</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTerms}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg.fetchall p-6">
            <p className="text-sm text-gray-600 font-medium">Misunderstood</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.misunderstoodCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-600 font-medium">With Instructions</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.instrCount}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top 5 Used Terms */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Most Used Terms</h3>
            {stats.top5Used.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.top5Used}
                      cx="50%" cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {stats.top5Used.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} times`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                  {stats.top5Used.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span>{item.name}: {item.value}x</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 h-64 flex items-center justify-center">No data</p>
            )}
          </div>

          {/* Misunderstanding Rate by Complexity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Misunderstanding Rate by Term Complexity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.complexityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) => `Complexity: ${label}`}
                />
                <Bar 
                  dataKey="percent" 
                  name="Misunderstanding %" 
                  fill="#EF4444" 
                  radius={[8, 8, 0, 0]}
                  label={{ position: 'top', formatter: (v) => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-gray-600 text-center">
              <p>Higher % = more users misunderstood terms in that complexity range</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            {recentActivity.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {showAll ? "Less" : `+${recentActivity.length - 5}`}
                {showAll ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {displayedActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No activity</p>
            ) : (
              displayedActivity.map((entry, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full p-4 flex justify-between items-center text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{entry.user}</span>
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                          {entry.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate max-w-xl">"{entry.document}"</p>
                      <p className="text-xs text-gray-500 mt-1">{entry.time}</p>
                    </div>
                    <div className="flex-shrink-0 w-5 h-5 text-gray-600">
                      {openIdx === idx ? <ChevronUpIcon className="w-full h-full" /> : <ChevronDownIcon className="w-full h-full" />}
                    </div>
                  </button>

                  {openIdx === idx && entry.originalText && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Original</h4>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">{entry.originalText}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Simplified</h4>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">{entry.simplifiedText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Full Table + Export */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              All Tracked Terms ({stats.allTerms.length})
            </h2>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                <FaFileCsv /> CSV
              </button>
              <button onClick={exportXLSX} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
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
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Score</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Misunderstood</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Instr</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Last Seen</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.allTerms.length > 0 ? (
                    stats.allTerms.map((t, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{t.term}</td>
                        <td className="px-3 py-3 text-gray-700">{t.usagecount || 0}</td>
                        <td className="px-3 py-3 text-gray-700">{(t.simpScore || 0).toFixed(2)}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.misunderstood ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}>
                            {t.misunderstood || 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.usageInstr ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {t.usageInstr ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs">
                          {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => confirmDelete(t.term)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                        No terms tracked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Term?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Remove <span className="font-medium">"{termToDelete}"</span> permanently?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;