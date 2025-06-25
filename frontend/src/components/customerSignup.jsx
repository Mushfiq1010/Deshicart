import React, { useState } from "react";
import API from "../Api.js";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CustomerSignup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: ""
  });
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/customer/signup", form);
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        dateOfBirth: "",
        gender: ""
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-sky-100 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Customer Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input" />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input" />
          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="input" />
          <select name="gender" value={form.gender} onChange={handleChange} required className="input">
            <option value="" disabled>Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button type="submit" className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              Sign Up
            </button>
          </div>
        </form>

        {success && (
          <div className="mt-6 text-center text-green-700">
            <p className="mb-2">Signup successful. Please log in:</p>
            <div className="flex justify-center gap-4">
              <Link to="/login/customer" className="link">Customer Login</Link>
              <Link to="/login/seller" className="link">Seller Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSignup;
