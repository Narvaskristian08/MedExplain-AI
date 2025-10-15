import React from "react";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-white to-[#d8ecff]">
      <main className="mx-auto max-w-[1440px] px-4 md:px-6 pt-4 md:pt-6 pb-16">
        
        <Navbar showAuthCtas />

        
        <section className="mt-2 md:mt-6 grid grid-cols-12 gap-10 lg:gap-12 items-center">
          
          
          <div className="col-span-12 lg:col-span-6 bg-transparent">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
              Simplify Complex
              <span className="block">Medical Texts</span>
            </h1>

            <p className="mt-4 max-w-xl text-slate-600">
              Turn clinical jargon into clear, accessible language. Paste your
              medical text or upload a file—our AI keeps the meaning while
              removing the noise.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/help"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-white shadow hover:bg-blue-600 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                Try it
              </a>

              <a
                href="#guide"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-slate-700 hover:border-slate-400 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 4h18M3 12h18M3 20h18" />
                </svg>
                Browse demo
              </a>
            </div>
          </div>

         
          <div className="relative col-span-12 lg:col-span-6 flex items-center justify-center">
           
            <div className="absolute inset-0 -z-10 bg-blue-500/10 blur-3xl" />

            
            <div className="relative flex items-center justify-center h-[420px]">
              <img
                src="/vector1.png"
                alt="blob outline"
                className="absolute w-[85%] opacity-90 select-none pointer-events-none"
                style={{
                  filter: "drop-shadow(0 0 0 10px rgba(255,255,255,0.95))",
                }}
                draggable="false"
              />
              <img
                src="/vector1.png"
                alt="blob fill"
                className="absolute w-[75%] select-none pointer-events-none"
                draggable="false"
              />
            </div>
          </div>
        </section>

        <section
          id="guide"
          className="mt-20 md:mt-24 bg-[#F5FAFF] py-16 rounded-[32px]"
        >
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-12">
            Here’s a quick guide
          </h2>

          <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
            {[
              "Paste your medical text or upload a document",
              "Our AI processes the text to remove complex jargon",
              "Compare the original and simplified versions side by side",
              "Download your explanation as a PDF",
            ].map((text, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-[0_18px_45px_-20px_rgba(30,64,175,.15)] p-8 h-[200px] text-center hover:shadow-[0_22px_55px_-18px_rgba(30,64,175,.22)] transition-all duration-200"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm">
                  {i + 1}
                </div>
                <p className="text-slate-700 text-sm max-w-[220px] leading-snug">
                  {text}.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
