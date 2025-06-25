import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api.js";

const SellerLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being sent:", form);

    try {
      const res = await API.post("/auth/seller/login", form);
      alert("Login successful");
      console.log(res.data);
      navigate("/seller/products");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-sky-100 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Seller Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            required
            className="input"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            required
            className="input"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button type="submit" className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;
