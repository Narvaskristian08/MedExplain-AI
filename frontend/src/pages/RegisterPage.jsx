import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function RegisterPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirm) {
      return setError("Please fill in all fields.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    if (typeof onLogin === "function") {
      onLogin({ email });
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
                alt="Illustration"
                className="w-full h-full object-cover object-center"
                draggable="false"
              />
            </div>
          </section>

          {/* Right form card */}
          <section className="flex justify-center">
            <div className="w-full lg:w-[720px] h-[600px] rounded-[28px] bg-white ring-1 ring-blue-500/10 shadow-[0_24px_70px_-20px_rgba(30,64,175,.28)] self-start">
              <div className="h-full p-8 md:p-10 lg:p-12 flex flex-col">
                <div className="mb-4">
                  <h1 className="text-[32px] font-bold text-slate-600 text-center">
                    Create account
                  </h1>
                  <p className="text-slate-500 text-center mt-2">
                    Please fill in your details.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form className="flex-1 space-y-5" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 lg:py-3.5 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 lg:py-3.5 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 lg:py-3.5 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-500 py-3.5 lg:py-4 text-base lg:text-lg text-white hover:bg-blue-600 transition"
                  >
                    Sign Up
                  </button>
                </form>

                <p className="pt-4 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-500 hover:underline">
                    Sign In
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
