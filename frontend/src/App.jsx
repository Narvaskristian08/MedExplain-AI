// src/App.jsx
import React, { useEffect, useState } from "react";
import { HomePage, LoginPage, RegisterPage, HelpPage, Dashboard } from "./pages";

// Map paths to simple route keys
const routes = {
  "/": "login",          // 👉 default root to login (we'll also rewrite URL)
  "/login": "login",
  "/register": "register",
  "/landing": "home",    // optional alias if you want /landing route
  "/help": "help",
  "/dashboard": "dashboard",
};

const resolve = (path) => routes[path] || "login";

export default function App() {
  const [page, setPage] = useState(resolve(location.pathname));

  // On first load: normalize "/" to "/login" in the address bar
  useEffect(() => {
    if (location.pathname === "/") {
      history.replaceState({}, "", "/login");
    }
    setPage(resolve(location.pathname));
  }, []);

  // Support back/forward
  useEffect(() => {
    const onPop = () => setPage(resolve(location.pathname));
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  // Intercept internal <a href="/..."> clicks
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return; // external or hash
      e.preventDefault();
      history.pushState({}, "", href);
      setPage(resolve(href));
      window.scrollTo(0, 0);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  switch (page) {
    case "login":
      return <LoginPage />;
    case "register":
      return <RegisterPage />;
    case "home":
      return <HomePage />; // Landing page
    case "help":
      return <HelpPage />;
    case "dashboard":
      return <Dashboard />;
    default:
      return <LoginPage />;
  }
}
