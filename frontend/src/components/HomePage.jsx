
import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Our Platform!</h1>
      <p>Please choose an option to continue:</p>
      
      <div style={{ margin: "1rem" }}>
        <Link to="/signup/seller" style={{ marginRight: "1rem", textDecoration: "none" }}>
          <button>Seller Signup</button>
        </Link>
        <Link to="/signup/customer" style={{ marginRight: "1rem", textDecoration: "none" }}>
          <button>Customer Signup</button>
        </Link>
      </div>

      <div style={{ margin: "1rem" }}>
        <Link to="/login/seller" style={{ marginRight: "1rem", textDecoration: "none" }}>
          <button>Seller Login</button>
        </Link>
        <Link to="/login/customer" style={{ marginRight: "1rem", textDecoration: "none" }}>
          <button>Customer Login</button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
