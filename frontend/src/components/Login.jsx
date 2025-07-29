import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import API from "../Api.js";

const Login = ({ userType }) => {
  const user =
    userType === "seller" ? "Seller" : userType === "admin" ? "Admin" : "Customer";

  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/auth/${userType}/login`, form, {
        withCredentials: true,
      });

      alert("Login successful");
      console.log(res.data);
      if (userType === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate(`/${userType}/products`);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-tr from-pink-100 via-sky-100 to-purple-100">
      <div className="w-full max-w-md bg-indigo-200 rounded-3xl shadow-2xl border border-indigo-300 p-10 backdrop-blur-md">
        <h2 className="text-4xl font-extrabold text-center text-indigo-800 mb-8 drop-shadow-sm">
          {user} Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="flex justify-between items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-1/2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;



