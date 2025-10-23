import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import { authAPI } from "../services/api";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email is invalid";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Demo behavior — replace with real auth if needed
      setTimeout(() => {
        setLoading(false);
        window.location.href = "/admin/dashboard";
      }, 700);
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || "Login failed" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#d8ecff]">
      <AdminHeader />

      {/* Main content — centered and slightly lifted */}
      <main className="flex-grow flex items-center justify-center px-6 pt-16">
        <div
          className="bg-white rounded-[35px] ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(64,128,255,0.25)] flex flex-col justify-center items-center"
          style={{
            width: "600px",      // ⬅️ smaller width
            height: "620px",     // ⬅️ smaller height
            padding: "55px 65px" // ⬅️ adjusted padding
          }}
        >
          <h2 className="text-3xl font-extrabold text-slate-700 text-center mb-6">
            Admin Login
          </h2>

          {errors.submit && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {errors.submit}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="w-full space-y-6 max-w-[360px]">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                }}
                className={`block w-full px-4 py-3 rounded-md border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                }}
                className={`block w-full px-4 py-3 rounded-md border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex justify-center py-3.5 px-4 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
