import React, { useState } from "react";

export default function Navbar({ showAuthCtas = false }) {
  const [open, setOpen] = useState(false);

  const UserIcon = ({ className = "h-4 w-4" }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      />
    </svg>
  );

  return (
    <header className="w-full bg-transparent">
      <nav className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
       
        <a href="/home" className="flex items-center gap-3 select-none">
          <span className="h-6 w-6 rounded-full bg-blue-500 shadow-md" />
          <span className="text-xl md:text-2xl font-semibold text-gray-800">
            MedExplain
          </span>
        </a>

        
        <div className="hidden md:flex items-center gap-4">
          <ul className="flex items-center gap-16 text-sm pr-2">
            <li>
              <a href="/home" className="text-slate-700 hover:text-slate-900">
                Home
              </a>
            </li>
            <li>
              <a
                href="/help"
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Simplify text
              </a>
            </li>
          </ul>

          {showAuthCtas && (
            <div className="flex items-center gap-2">
              
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 shadow-sm"
              >
                <UserIcon className="h-4 w-4" />
                Sign in
              </a>

              
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300 shadow-sm"
              >
                <UserIcon className="h-4 w-4" />
                Guest
              </a>
            </div>
          )}
        </div>

       
        <button
          onClick={() => setOpen((v) => !v)}
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

            {showAuthCtas && (
              <>
                <a
                  href="/login"
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  <UserIcon />
                  Sign in
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300 shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  <UserIcon />
                  Guest
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
