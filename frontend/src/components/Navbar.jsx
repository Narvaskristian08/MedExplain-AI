import React, { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-transparent">
      <nav className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
       
        <a href="/" className="flex items-center gap-3 select-none">
          <span className="h-6 w-6 rounded-full bg-blue-500 shadow-md" />
          <span className="text-xl md:text-2xl font-semibold text-gray-800">
            MedExplain
          </span>
        </a>

        
        <ul className="hidden md:flex items-center gap-8 md:gap-10 lg:gap-12 text-base font-medium pr-4">
        <li>
         <a href="/" className="text-gray-600 hover:text-gray-800 transition-colors">Home</a>
         </li>
         <li>
         <a href="/help" className="text-gray-600 hover:text-gray-800 transition-colors">Simplify text</a>
         </li>
        </ul>


        
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-gray-700"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </nav>

      
      {open && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2 text-base">
            <a href="/" className="py-2 text-gray-700 hover:text-gray-900" onClick={() => setOpen(false)}>Home</a>
            <a href="/help" className="py-2 text-gray-700 hover:text-gray-900" onClick={() => setOpen(false)}>Simplify text</a>
          </div>
        </div>
      )}
    </header>
  );
}
