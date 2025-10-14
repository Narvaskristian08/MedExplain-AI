import React from "react";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <main className="mx-auto max-w-7xl px-4 md:px-6 pt-4 md:pt-6 pb-10 md:pb-14">
        <Navbar />

        
        <div className="mt-4 lg:mt-8 flex flex-col lg:flex-row lg:items-stretch lg:gap-10 justify-center">

        
          <section className="hidden lg:flex justify-center">
            <div className="w-[640px] min-h-[560px] rounded-[28px] bg-white shadow-[0_20px_60px_-20px_rgba(30,64,175,.25)] p-8 flex items-center justify-center">
              <img
                src="/login-illustration.png"
                alt="AI Doctor"
                className="w-full h-full rounded-2xl object-contain"
              />
            </div>
          </section>

          
          <section className="flex justify-center">
            <div className="w-[640px] min-h-[560px] rounded-[28px] bg-white shadow-[0_20px_60px_-20px_rgba(30,64,175,.25)] p-8 flex flex-col">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-3">
                  Welcome!
                </h1>
                <p className="text-center text-gray-500 mb-8 text-base md:text-lg">
                  Please enter your email and password.
                </p>
              </div>

              <form className="space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" /> Remember me
                    </label>
                    <a href="#" className="hover:underline">Forgot Password</a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-500 py-3 text-base text-white hover:bg-blue-600 transition"
                >
                  Sign In
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <a href="#" className="text-blue-600 hover:underline">Sign Up</a>
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
