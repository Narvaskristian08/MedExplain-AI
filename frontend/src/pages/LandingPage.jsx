import React from "react";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <main className="mx-auto max-w-[1440px] px-4 md:px-6 pt-4 md:pt-6 pb-16">
        <Navbar />

        
        <section className="mt-6 md:mt-10 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
              Simplify Complex
              <span className="block">Medical Texts</span>
            </h1>

            <p className="mt-4 max-w-xl text-slate-600">
              Turn clinical jargon into clear, accessible language. Paste your medical
              text or upload a file—our AI keeps the meaning while removing the noise.
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

          
          <div className="relative">
            <div className="aspect-[4/3] rounded-[28px] bg-white shadow-[0_24px_70px_-22px_rgba(30,64,175,.28)] overflow-hidden flex items-center justify-center">
              
              <svg
                viewBox="0 0 600 500"
                className="w-[90%] h-auto fill-blue-100"
                aria-hidden="true"
              >
                <path d="M439,90c38,33,66,89,67,132s-24,74-51,107c-27,34-55,64-96,78s-95,9-139-10-77-51-99-86-29-73-22-111,31-73,67-97S271,69,319,67,401,57,439,90Z" />
              </svg>
            </div>
            
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-blue-500/5 blur-2xl"></div>
          </div>
        </section>

      
        <section id="guide" className="mt-16 md:mt-20">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900">
            Here’s a quick guide
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           
            <div className="rounded-2xl bg-white p-5 shadow-[0_18px_45px_-20px_rgba(30,64,175,.18)]">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
                1
              </div>
              <p className="text-sm text-slate-700">
                Paste your medical text or upload a document.
              </p>
            </div>

            
            <div className="rounded-2xl bg-white p-5 shadow-[0_18px_45px_-20px_rgba(30,64,175,.18)]">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
                2
              </div>
              <p className="text-sm text-slate-700">
                Our AI processes the text to remove complex jargon.
              </p>
            </div>

            
            <div className="rounded-2xl bg-white p-5 shadow-[0_18px_45px_-20px_rgba(30,64,175,.18)]">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
                3
              </div>
              <p className="text-sm text-slate-700">
                Compare the original and simplified versions side by side.
              </p>
            </div>

            
            <div className="rounded-2xl bg-white p-5 shadow-[0_18px_45px_-20px_rgba(30,64,175,.18)]">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
                4
              </div>
              <p className="text-sm text-slate-700">
                Download your explanation as a PDF.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
