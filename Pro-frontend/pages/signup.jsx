import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:6000/api/V1/student/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful! You can now login.");
        setForm({
          studentName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setMessage(data.message || "Signup failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          Student Signup
        </h2>
        <input
          type="text"
          name="studentName"
          placeholder="Full Name"
          value={form.studentName}
          onChange={handleChange}
          required
          className="px-4 py-2 rounded bg-white/80 focus:outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="px-4 py-2 rounded bg-white/80 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="px-4 py-2 rounded bg-white/80 focus:outline-none"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="px-4 py-2 rounded bg-white/80 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 rounded transition"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {message && (
          <div className="text-center text-sm mt-2 text-white bg-indigo-700/60 rounded p-2">
            {message}
          </div>
        )}
        <a
          href="/"
          className="text-xs text-indigo-200 hover:underline text-center mt-2"
        >
          Back to Home
        </a>
      </form>
    </div>
  );
};

export default Signup;
