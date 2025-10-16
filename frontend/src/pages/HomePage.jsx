import React from "react";
import Header from "../components/Header";

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#d8ecff]">
      <Header user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:text-left relative">
            {/* Decorative blob */}
            <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 -z-10">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-900">
              Simplify Complex
              <span className="block">Medical Texts</span>
            </h1>

            <p className="mt-4 md:mt-5 max-w-xl lg:max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg md:text-xl text-slate-600">
              Turn clinical jargon into clear, accessible language. Paste your
              medical text or upload a file—our AI keeps the meaning while
              removing the noise.
            </p>

            <div className="mt-6 md:mt-8 max-w-md mx-auto lg:mx-0 sm:flex sm:justify-start">
              <div className="rounded-full shadow sm:mr-3">
                <a
                  href="/help"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base md:text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  Try it
                </a>
              </div>
              <div className="mt-3 sm:mt-0 rounded-full shadow">
                <a
                  href="#guide"
                  className="w-full flex items-center justify-center px-8 py-3 border border-slate-300 text-base md:text-lg font-medium rounded-full text-slate-700 bg-white hover:border-slate-400 transition"
                >
                  Browse demo
                </a>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="mt-10 lg:mt-0 lg:absolute lg:top-1/2 lg:right-0 lg:-translate-y-1/2 lg:w-[520px] flex items-center justify-center">
              <div className="relative h-[380px] w-full">
                <img
                  src="/vector1.png"
                  alt="blob outline"
                  className="absolute inset-0 m-auto w-[85%] opacity-90 select-none pointer-events-none"
                  style={{
                    filter:
                      "drop-shadow(0 0 0 10px rgba(255,255,255,0.95))",
                  }}
                  draggable="false"
                />
                <img
                  src="/vector1.png"
                  alt="blob fill"
                  className="absolute inset-0 m-auto w-[75%] select-none pointer-events-none"
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="guide" className="py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Here’s a quick guide
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Four simple steps to get your results
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Paste your medical text or upload a document",
                "Our AI processes the text to remove complex jargon",
                "Compare the original and simplified versions side by side",
                "Download your explanation as a PDF",
              ].map((step, index) => (
                <div key={index} className="pt-0">
                  <div className="flow-root bg-white rounded-2xl px-6 pb-8 shadow-[0_18px_45px_-20px_rgba(30,64,175,.15)] hover:shadow-[0_22px_55px_-18px_rgba(30,64,175,.22)] transition-all">
                    <div className="-mt-6">
                      <div className="mb-4">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm leading-snug max-w-[260px]">
                        {step}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-700 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Create your account today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of users already using our platform.
          </p>
          <a
            href="/register"
            className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition"
          >
            Get started for free
          </a>
        </div>
      </div>


      <footer className="bg-gray-900 mt-12">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2024 My App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
