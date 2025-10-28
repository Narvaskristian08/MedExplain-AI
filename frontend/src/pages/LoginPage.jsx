import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { authAPI } from "../services/api";
import loginImage from "../assets/login-illustration.png";

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const errorTimeoutRef = useRef(null);
  const renderCount = useRef(0);
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    renderCount.current += 1;
    console.log(`LoginPage render count: ${renderCount.current}, Errors:`, errors, "Location:", location.pathname);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", submit: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered, preventing default, Current URL:", window.location.href);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await authAPI.login(formData.email, formData.password);
      console.log("LoginPage handleSubmit - Login response:", data);
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onLogin) onLogin({ ...data.user, token: data.token });
        setTimeout(() => navigate("/simplify"), 0);
      } else {
        throw new Error("Invalid response: Missing token or user data");
      }
    } catch (error) {
      console.error("LoginPage handleSubmit - Login error:", error.response?.data || error);
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || "Login failed. Please try again.",
      }));
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setErrors((prev) => ({ ...prev, submit: "" })), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      console.log("LoginPage unmounted");
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <Header />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
          <div className="hidden lg:flex bg-white rounded-[30px] shadow-xl overflow-hidden items-center justify-center min-h-[600px]">
            <img src={loginImage} alt="Login illustration" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white rounded-[30px] shadow-xl flex items-center justify-center p-10 min-h-[600px]">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                <p className="mt-2 text-sm text-gray-600">Welcome back</p>
              </div>
              <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                <div className="space-y-4">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-900">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-2">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </Link>
                </div>
                {errors.submit && (
                  <div className="text-red-600 text-sm text-center" role="alert" style={{ minHeight: "1.5em" }}>
                    {errors.submit}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;