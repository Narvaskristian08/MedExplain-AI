import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("me_remember") === "1";
    const savedEmail = localStorage.getItem("me_email") || "";
    if (saved && savedEmail) {
      setRemember(true);
      setEmail(savedEmail);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !password) {
      setErr("Please enter both email and password.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

    if (email !== email.toLowerCase()) {
      setErr("Email must be in lowercase letters.");
      return;
    }
    if (!email.endsWith("@gmail.com")) {
      setErr("Only Gmail accounts are allowed.");
      return;
    }

    if (remember) {
      localStorage.setItem("me_remember", "1");
      localStorage.setItem("me_email", email);
    } else {
      localStorage.removeItem("me_remember");
      localStorage.removeItem("me_email");
    }

    if (typeof onLogin === "function") {
      onLogin({ email });
    } else {
      window.location.href = "/home";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#d8ecff]">
      <main className="mx-auto max-w-[1520px] px-4 md:px-6 pt-4 md:pt-6 pb-10 md:pb-14">
        <Navbar />

        <div className="mt-4 lg:mt-10 flex flex-col lg:flex-row lg:items-start lg:gap-14 justify-center">
          {/* Left illustration — transparent container */}
          <section className="hidden lg:flex justify-center">
            <div className="w-full lg:w-[720px] h-[600px] rounded-[28px] bg-transparent overflow-hidden self-start">
              <img
                src="/login-illustration.png"
                alt="AI Doctor"
                className="w-full h-full object-cover object-center"
                draggable="false"
              />
            </div>
          </section>

          {/* Right form card */}
          <section className="flex justify-center">
            <div className="w-full lg:w-[720px] h-[600px] rounded-[28px] bg-white ring-1 ring-blue-500/10 shadow-[0_24px_70px_-20px_rgba(30,64,175,.28)] p-8 md:p-10 lg:p-12 flex flex-col self-start">
              <div>
                <h1 className="text-[32px] font-bold text-slate-600 text-center mb-2">
                  Welcome!
                </h1>
                <p className="text-slate-500 text-center mb-8">
                  Please enter your Gmail address and password.
                </p>
              </div>

              {err && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              <form className="space-y-6 flex-1" onSubmit={onSubmit} noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your Gmail address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3.5 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3.5 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs lg:text-sm text-gray-500">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 accent-blue-600"
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

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-500 py-3.5 lg:py-4 text-base lg:text-lg text-white hover:bg-blue-600 transition"
                >
                  Sign In
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <a
                    href="/register"
                    className="text-blue-500 hover:underline"
                  >
                    Sign Up
                  </a>
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
