import React, { useState, useEffect } from "react";
import API from "../Api.js";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SellerSignup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    storeName: "",
    storeDescription: "",
  });
  const [walletUsername, setWalletUsername] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // On mount, check for walletUsername in the URL (from wallet app redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const walletUsernameFromUrl = params.get("walletUsername");
    if (walletUsernameFromUrl) setWalletUsername(walletUsernameFromUrl);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletUsername) {
      alert("Please add a payment system first.");
      return;
    }
    try {
      await API.post("/auth/seller/signup", { ...form, walletUsername });
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        storeName: "",
        storeDescription: "",
      });
      setWalletUsername("");
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-sky-100 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Seller Signup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Personal Information
            </h3>
            <div className="space-y-3">
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
            </div>
          </div>

          {/* Store Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">
              Store Information
            </h3>
            <div className="space-y-3">
              <input name="storeName" placeholder="Store Name" value={form.storeName} onChange={handleChange} required className="input" />
              <textarea name="storeDescription" placeholder="Store Description" value={form.storeDescription} onChange={handleChange} required rows="3" className="input resize-none"></textarea>
            </div>
          </div>

          {/* Payment System */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">
              Payment System
            </h3>
            {!walletUsername ? (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  To receive payments, please add a payment system (wallet).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const redirectUri = encodeURIComponent(window.location.origin+"/signup/seller");
                    window.location.href = `http://localhost:5050/api/auth?redirect_uri=${redirectUri}`;
                  }}
                  className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Add Payment System
                </button>
              </>
            ) : (
              <div className="mb-2 text-green-700">
                Payment system added ✔ (Wallet Username: {walletUsername})
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
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
              <Link to="/login/seller" className="link">Seller Login</Link>
              <Link to="/login/customer" className="link">Customer Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerSignup;