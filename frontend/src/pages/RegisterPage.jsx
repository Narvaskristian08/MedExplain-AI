import React, { useState } from "react";
import Header from "../components/Header";
import { authAPI } from "../services/api";

export default function RegisterPage({ onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErr, setFieldErr] = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErr[name]) setFieldErr((prev) => ({ ...prev, [name]: "" }));
    if (submitErr) setSubmitErr("");
  };

  const validateForm = () => {
    const errs = {};
    const { email, password, confirmPassword } = formData;

    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email is invalid";

    if (!password) errs.password = "Password is required";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters";

    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await authAPI.register({
        email: formData.email,
        password: formData.password,
        role: "user",
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (typeof onLogin === "function") onLogin(data.user);
    } catch (error) {
      setSubmitErr(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#d8ecff]">
      <Header />

      {/* make layout identical to Login */}
      <main className="mx-auto max-w-[1280px] px-6 md:px-8 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — same wrapper + size as Login */}
          <section className="w-full flex justify-center items-center">
            <div className="w-full max-w-[740px] flex justify-center items-center">
              <img
                src="/Med.svg"
                alt="Medical illustration"
                className="w-full h-[660px] object-contain select-none"
                draggable="false"
              />
            </div>
          </section>

          {/* RIGHT — same card width/padding as Login */}
          <section className="w-full flex justify-center items-center">
            <div className="w-full max-w-[740px] rounded-[28px] bg-white ring-1 ring-black/5 shadow-[0_28px_90px_-30px_rgba(30,64,175,.25)]">
              <div className="px-10 lg:px-12 py-10">
                <h1 className="text-[36px] font-extrabold text-slate-700 text-center">
                  Register!
                </h1>
                <p className="mt-2 text-center text-[15px] text-gray-500">
                  Please enter your Gmail address and create a password.
                </p>

                {submitErr && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 text-center">
                    {submitErr}
                  </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your Gmail address"
                      className={`w-full h-[54px] rounded-[12px] border px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        fieldErr.email ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {fieldErr.email && (
                      <p className="mt-1 text-xs text-red-600">{fieldErr.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create your password"
                      className={`w-full h-[54px] rounded-[12px] border px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        fieldErr.password ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {fieldErr.password && (
                      <p className="mt-1 text-xs text-red-600">{fieldErr.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`w-full h-[54px] rounded-[12px] border px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        fieldErr.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErr.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErr.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[54px] rounded-[12px] bg-[#4d9dff] text-white text-[15px] font-semibold hover:bg-[#3f8ef3] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </button>

                  <p className="text-center text-[13px] text-gray-600">
                    Already have an account?{" "}
                    <a className="text-blue-500 hover:underline" href="/login">
                      Sign In
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
