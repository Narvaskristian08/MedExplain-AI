import React, { useState } from "react";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-transparent absolute top-0 left-0 w-full z-50">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 md:px-8 pt-8 pb-2">
        {/* Left: Brand */}
        <a href="/home" className="flex items-center gap-2 select-none">
          <span className="h-6 w-6 rounded-full bg-blue-500 shadow-md" />
          <h1 className="text-xl font-bold text-gray-900">MedExplain</h1>
        </a>

        {/* Right: Nav Links with natural top space */}
        <nav className="hidden md:flex items-center gap-14 text-sm pr-1">
          <a
            href="/home"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            Home
          </a>
          <a
            href="/help"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            Simplify text
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-gray-700 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-gray-100">
          <div className="flex flex-col px-6 py-3 gap-2 text-base">
            <a
              href="/home"
              className="py-2 text-gray-700 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              Home
            </a>
            <a
              href="/help"
              className="py-2 text-gray-700 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              Simplify text
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
