// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          apiService.get("/admin/stats"),
          apiService.get("/admin/users"),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const verifyUser = async (id) => {
    await apiService.patch(`/api/admin/users/${id}/verify`);
    setUsers(users.map(u => u._id === id ? { ...u, isVerified: true } : u));
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await apiService.delete(`/api/admin/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  if (loading) return <div className="flex justify-center p-10 text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: "Total Queries", value: stats.summary.totalQueries },
            { label: "Guest Queries", value: stats.summary.guestQueries },
            { label: "User Queries", value: stats.summary.userQueries },
            { label: "Unique Users", value: stats.summary.totalUniqueUsers },
            { label: "Active (7d)", value: stats.summary.activeLastWeek },
            { label: "Avg SimpScore", value: stats.summary.averageSimpScore },
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-md text-center">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold text-blue-600">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top Terms */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Top 10 Medical Terms</h2>
            <div className="space-y-2">
              {stats.topTerms.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-medium">{t.term}</span>
                  <span className="text-gray-600">Used {t.usagecount}x</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2 text-sm">
              {stats.recentActivity.map((a, i) => (
                <div key={i} className="flex justify-between">
                  <span>{a.isGuest ? "Guest" : a.userId}</span>
                  <span className="text-gray-500">
                    {new Date(a.createdAt).toLocaleString()} • {a.inputType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2">
                      {u.isVerified ? "Verified" : "Unverified"}
                    </td>
                    <td className="py-2 space-x-2">
                      {!u.isVerified && (
                        <button
                          onClick={() => verifyUser(u._id)}
                          className="text-green-600 hover:underline text-xs"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;