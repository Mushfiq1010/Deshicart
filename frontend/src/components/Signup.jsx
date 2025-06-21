import React, { useState } from "react";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/signup", formData, {
        withCredentials: true
      });
      console.log("Signup successful", res.data);
      alert("Signup successful!");
    } catch (err) {
      console.error("Signup error", err);
      alert("Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required /><br />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} /><br />
        <input type="date" name="dateOfBirth" onChange={handleChange} /><br />
        <input type="text" name="gender" placeholder="Gender" onChange={handleChange} /><br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;


