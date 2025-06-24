import React, { useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/seller/change-password", form);

      alert("Password changed. You’ll be logged out now.");

      
      await API.post("/auth/logout");

    
      localStorage.clear(); 

      navigate("/login/seller");
    } catch (err) {
      console.error(err);
      alert("Failed to change password: " + err.response?.data?.error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit" style={{ marginTop: "1rem" }}>Change Password</button>
      </form>
    </div>
  );
};

export default ChangePassword;
