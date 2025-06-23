import React, { useState } from "react";
import API from "../Api.js";
import { Link } from "react-router-dom";

const CustomerSignup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: ""
  });

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
    <>
      <form onSubmit={handleSubmit}>
        <h2>Customer Signup</h2>
        <input name="name" placeholder="Name" onChange={handleChange} value={form.name} required />
        <input name="email" placeholder="Email" onChange={handleChange} value={form.email} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} value={form.password} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} value={form.phone} />
        <input name="dateOfBirth" type="date" onChange={handleChange} value={form.dateOfBirth} />
        <input name="gender" placeholder="Gender" onChange={handleChange} value={form.gender} />
        <button type="submit">Sign Up</button>
      </form>

      {success && (
        <div style={{ marginTop: "1rem" }}>
          <p>Signup successful. Please log in:</p>
          <Link to="/login/customer" style={{ marginRight: "1rem" }}>Customer Login</Link>
          <Link to="/login/seller">Seller Login</Link>
        </div>
      )}
    </>
  );
};

export default CustomerSignup;

