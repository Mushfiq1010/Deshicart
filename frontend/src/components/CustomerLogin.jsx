import React, { useState } from "react";
import API from "../Api.js";
import { useNavigate } from "react-router-dom"; 
const CustomerLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
const navigate=useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("auth/customer/login", form);
      alert("Login successful");
      console.log(res.data);
      navigate("/customer/products");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Customer Login</h2>
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default CustomerLogin;
