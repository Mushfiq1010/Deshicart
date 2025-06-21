import React from "react";
import API from "../Api.js";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await API.post("/logout");
      alert("Logged out successfully");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <div>
      <h2>Logout</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
