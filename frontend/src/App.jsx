import React, { useEffect, useState } from "react";
import { HomePage, LoginPage, RegisterPage, HelpPage, Dashboard } from "./pages";

const routes = {
  "/": "login",
  "/login": "login",
  "/register": "register",
  "/home": "home",      
  "/landing": "home",    
  "/help": "help",
  "/dashboard": "dashboard",
};


// If the pathname isn't in the routes table, fall back to "login".
const resolve = (path) => routes[path] || "login";

export default function App() {
  const [page, setPage] = useState(resolve(location.pathname));

  useEffect(() => {
    if (location.pathname === "/") {
      history.replaceState({}, "", "/login");
    }
    setPage(resolve(location.pathname));
  }, []);

 
  useEffect(() => {
    const onPop = () => setPage(resolve(location.pathname));
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return; 
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
      return <HomePage />; 
    case "help":
      return <HelpPage />;
    case "dashboard":
      return <Dashboard />;
    default:
      return <LoginPage />;
  }
}
