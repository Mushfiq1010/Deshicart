import React, { useState } from "react";
import API from "../Api.js";
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

  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/seller/signup", form);
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
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2>Seller Signup</h2>
        <input name="name" placeholder="Name" onChange={handleChange} value={form.name} required />
        <input name="email" placeholder="Email" onChange={handleChange} value={form.email} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} value={form.password} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} value={form.phone} />
        <input name="dateOfBirth" type="date" onChange={handleChange} value={form.dateOfBirth} />
        <input name="gender" placeholder="Gender" onChange={handleChange} value={form.gender} />
        <input name="storeName" placeholder="Store Name" onChange={handleChange} value={form.storeName} required />
        <input name="storeDescription" placeholder="Store Description" onChange={handleChange} value={form.storeDescription} required />
        <button type="submit">Sign Up</button>
      </form>

      {success && (
        <div style={{ marginTop: "1rem" }}>
          <p>Signup successful. Please log in:</p>
          <Link to="/login/seller" style={{ marginRight: "1rem" }}>Seller Login</Link>
          <Link to="/login/customer">Customer Login</Link>
        </div>
      )}
    </>
  );
};

export default SellerSignup;




