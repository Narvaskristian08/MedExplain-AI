import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { authAPI } from "../services/api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErr, setFieldErr] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("me_remember") === "1";
    const savedEmail = localStorage.getItem("me_email") || "";
    if (saved && savedEmail) {
      setRemember(true);
      setEmail(savedEmail);
    }
  }, []);

  const validate = () => {
    const fe = { email: "", password: "" };
    let ok = true;

    if (!email) {
      fe.email = "Email is required";
      ok = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      fe.email = "Please enter a valid email address.";
      ok = false;
    } else if (email !== email.toLowerCase()) {
      fe.email = "Email must be in lowercase letters.";
      ok = false;
    } else if (!email.endsWith("@gmail.com")) {
      fe.email = "Only Gmail accounts are allowed.";
      ok = false;
    }

    if (!password) {
      fe.password = "Password is required";
      ok = false;
    } else if (password.length < 6) {
      fe.password = "Password must be at least 6 characters";
      ok = false;
    }

    setFieldErr(fe);
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setFieldErr({ email: "", password: "" });
    if (!validate()) return;

    if (remember) {
      localStorage.setItem("me_remember", "1");
      localStorage.setItem("me_email", email);
    } else {
      localStorage.removeItem("me_remember");
      localStorage.removeItem("me_email");
    }

    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (typeof onLogin === "function") onLogin(data.user);
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#d8ecff]">
      <Header />

      {/* Layout Spacing */}
      <main className="mx-auto max-w-[1280px] px-6 md:px-8 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT — Illustration same width as form */}
          <section className="w-full flex justify-center items-center">
            <div className="w-full max-w-[740px] flex justify-center items-center">
              <img
                src="/Med.svg"
                alt="Medical illustration"
                className="w-full h-[660px] object-contain select-none"
                draggable="false"
              />
            </div>
          </section>

          {/* RIGHT — Login card */}
          <section className="w-full flex justify-center items-center">
            <div className="w-full max-w-[740px] rounded-[28px] bg-white ring-1 ring-black/5 shadow-[0_28px_90px_-30px_rgba(30,64,175,.25)]">
              <div className="px-10 lg:px-12 py-10">
                <h1 className="text-[36px] font-extrabold text-slate-700 text-center">
                  Welcome!
                </h1>
                <p className="mt-2 text-center text-[15px] text-gray-500">
                  Please enter your Gmail address and password.
                </p>

                {err && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 text-center">
                    {err}
                  </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your Gmail address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErr.email)
                          setFieldErr((p) => ({ ...p, email: "" }));
                      }}
                      className={`w-full h-[54px] rounded-[12px] border px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        fieldErr.email ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {fieldErr.email && (
                      <p className="mt-1 text-xs text-red-600">{fieldErr.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErr.password)
                          setFieldErr((p) => ({ ...p, password: "" }));
                      }}
                      className={`w-full h-[54px] rounded-[12px] border px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        fieldErr.password ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-blue-600"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                        />
                        Remember me
                      </label>
                      <a
                        href="/forgot-password"
                        className="text-blue-500 hover:underline"
                      >
                        Forgot Password
                      </a>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[54px] rounded-[12px] bg-[#4d9dff] text-white text-[15px] font-semibold hover:bg-[#3f8ef3] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                  <p className="text-center text-[13px] text-gray-600">
                    Don’t have an account?{" "}
                    <a href="/register" className="text-blue-500 hover:underline">
                      Sign Up
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
