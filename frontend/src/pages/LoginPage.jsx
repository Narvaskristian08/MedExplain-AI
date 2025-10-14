import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !password) {
      setErr("Please enter both email and password.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr("Please enter a valid email.");
      return;
    }

    history.pushState({}, "", "/home");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <main className="mx-auto max-w-[1520px] px-4 md:px-6 pt-4 md:pt-6 pb-10 md:pb-14">
        <Navbar />

        <div className="mt-4 lg:mt-10 flex flex-col lg:flex-row lg:items-stretch lg:gap-14 justify-center">
         
          <section className="hidden lg:flex justify-center">
            <div className="w-full lg:w-[720px] h-[600px] rounded-[28px] bg-white shadow-[0_24px_70px_-20px_rgba(30,64,175,.28)] overflow-hidden">
              <img
                src="/login-illustration.png"
                alt="AI Doctor"
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>
          </section>

          
          <section className="flex justify-center">
            <div className="w-full lg:w-[720px] min-h-[600px] rounded-[28px] bg-white shadow-[0_24px_70px_-20px_rgba(30,64,175,.28)] p-8 md:p-10 lg:p-12 flex flex-col">
              <div>
                <h1 className="text-[32px] font-bold text-slate-600 text-center mb-2">Welcome!</h1>
                <p className="text-slate-500 text-center mb-8">Please enter your email and password.</p>
              </div>

              {err && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              <form className="space-y-6 flex-1" onSubmit={onSubmit} noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3.5 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3.5 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs lg:text-sm text-gray-500">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1 accent-blue-600" />
                      Remember me
                    </label>
                    <a href="/help" className="text-blue-500 hover:underline">Forgot Password</a>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-lg bg-blue-500 py-3.5 lg:py-4 text-base lg:text-lg text-white hover:bg-blue-600 transition">
                  Sign In
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <a href="/register" className="text-blue-500 hover:underline">Sign Up</a>
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
