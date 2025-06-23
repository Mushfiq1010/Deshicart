import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import API from "../Api.js"; 

const SellerLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); 

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being sent:", form);

    try {
      const res = await API.post("auth/seller/login", form); // POST request for login
      alert("Login successful");
      console.log(res.data);

      // If login is successful, redirect to /seller/products
      navigate("/seller/products"); // Redirect to seller's product page
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Seller Login</h2>
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
        value={form.email} // Bind form state to the input field
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
        value={form.password} // Bind form state to the input field
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default SellerLogin;


