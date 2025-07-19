import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 px-4 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-4">DeshiCart</h1>
        <p className="text-gray-600 text-lg mb-8">
          Your one-stop shop for authentic Bangladeshi products – straight from the heart of our homeland.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Link to="/signup/seller" className="w-full sm:w-auto">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition">
              Sign Up as Seller
            </button>
          </Link>
          <Link to="/signup/customer" className="w-full sm:w-auto">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition">
              Sign Up as Customer
            </button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login/seller" className="w-full sm:w-auto">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition">
              Login as Seller
            </button>
          </Link>
          <Link to="/login/customer" className="w-full sm:w-auto">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition">
              Login as Customer
            </button>
          </Link>
           <Link to="/login/admin" className="w-full sm:w-auto">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition">
              Login as Admin
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
