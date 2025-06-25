import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to DeshiCart!</h1>
      <p className="text-lg text-gray-600 mb-8">Please choose an option to continue:</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Link to="/signup/seller">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded shadow-md transition">
            Seller Signup
          </button>
        </Link>
        <Link to="/signup/customer">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow-md transition">
            Customer Signup
          </button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/login/seller">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow-md transition">
            Seller Login
          </button>
        </Link>
        <Link to="/login/customer">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded shadow-md transition">
            Customer Login
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
