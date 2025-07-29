import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-blue-200 to-teal-300 relative px-4 py-10"
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-blue-200 to-teal-300"></div>

      {/* Main content box (larger size) */}
      <div className="relative z-10 bg-white/90 rounded-3xl p-16 max-w-4xl w-full text-center shadow-2xl border-t-8 border-teal-600">
        <h1 className="text-6xl font-extrabold text-teal-700 mb-6 tracking-wide drop-shadow-lg">DeshiCart</h1>
        <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          Discover authentic Bangladeshi products and connect directly with local sellers. 
          Your shopping journey begins here!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-6">
          <Link to="/signup/seller" className="w-full sm:w-auto">
            <button className="w-full sm:w-64 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-5 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
              Sign Up as Seller
            </button>
          </Link>
          <Link to="/signup/customer" className="w-full sm:w-auto">
            <button className="w-full sm:w-64 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
              Sign Up as Customer
            </button>
          </Link>
        </div>

        {/* Aligning the 3 buttons in the last row in a single level */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-6">
          <Link to="/login/seller" className="w-full sm:w-auto">
            <button className="w-full sm:w-64 bg-green-600 hover:bg-green-700 text-white font-semibold py-5 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
              Login as Seller
            </button>
          </Link>
          <Link to="/login/customer" className="w-full sm:w-auto">
            <button className="w-full sm:w-64 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
              Login as Customer
            </button>
          </Link>
          <Link to="/login/admin" className="w-full sm:w-auto">
            <button className="w-full sm:w-64 bg-red-600 hover:bg-red-700 text-white font-semibold py-5 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
              Login as Admin
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;



