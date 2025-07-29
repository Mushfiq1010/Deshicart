import React from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      alert("Logged out successfully");
      navigate("/");
    } catch (err) {
      alert("Logout failed");
    }
  };

  const goToUsers = () => navigate("/admin/users");
  const goToProducts = () => navigate("/admin/products");
  const goToReports = () => navigate("/admin/reports");
  const gotoCategories = () => navigate("/admin/categories");
  const goToTaxrate = () => navigate("/admin/taxrate");
  const goToOrders = () => navigate("/admin/orders");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 shadow-md">
        <h1 className="text-3xl font-semibold tracking-wider">Admin Dashboard</h1>
      </header>

      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome, Admin!</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Users */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 shadow-xl rounded-2xl overflow-hidden p-6 hover:shadow-2xl transition-all transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-4 text-white">Manage Users</h3>
            <p className="text-gray-100 mb-4">
              View or remove sellers and customers.
            </p>
            <button
              onClick={goToUsers}
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-5 py-3 rounded-lg transition-all hover:from-yellow-400 hover:to-yellow-600"

            >
              Go to Users
            </button>
          </div>

          {/* Manage Products */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 shadow-xl rounded-2xl overflow-hidden p-6 hover:shadow-2xl transition-all transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-4 text-white">Manage Products</h3>
            <p className="text-gray-100 mb-4">
              Approve or remove listed products.
            </p>
            <button
              onClick={goToProducts}
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-5 py-3 rounded-lg transition-all hover:from-yellow-400 hover:to-yellow-600"

            >
              Go to Products
            </button>
          </div>

          {/* View Reports */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 shadow-xl rounded-2xl overflow-hidden p-6 hover:shadow-2xl transition-all transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-4 text-white">View Reports</h3>
            <p className="text-gray-100 mb-4">
              Check sales, user stats, and more.
            </p>
            <button
              onClick={goToReports}
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-5 py-3 rounded-lg transition-all hover:from-yellow-400 hover:to-yellow-600"

            >
              View Reports
            </button>
          </div>

          {/* Manage Categories */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 shadow-xl rounded-2xl overflow-hidden p-6 hover:shadow-2xl transition-all transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-4 text-white">Manage Categories</h3>
            <p className="text-gray-100 mb-4">
              Create, edit, or delete product categories.
            </p>
            <button
              onClick={gotoCategories}
             className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-5 py-3 rounded-lg transition-all hover:from-yellow-400 hover:to-yellow-600"

            >
              Go to Categories
            </button>
          </div>

          {/* Manage Taxrate */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 shadow-xl rounded-2xl overflow-hidden p-6 hover:shadow-2xl transition-all transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-4 text-white">Manage Taxrate</h3>
            <p className="text-gray-100 mb-4">
              Set the government issued tax rates for each category.
            </p>
            <button
              onClick={goToTaxrate}
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-5 py-3 rounded-lg transition-all hover:from-yellow-400 hover:to-yellow-600"

            >
              Go to Taxrates
            </button>
          </div>

          {/* Manage Orders */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 shadow-xl rounded-2xl overflow-hidden p-6 hover:shadow-2xl transition-all transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-4 text-white">Manage Orders</h3>
            <p className="text-gray-100 mb-4">
              Approve delivered product orders.
            </p>
            <button
              onClick={goToOrders}
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black px-5 py-3 rounded-lg transition-all hover:from-yellow-400 hover:to-yellow-600"


            >
              Go to Orders
            </button>
          </div>
        </div>
      </main>

      <footer className="p-6 bg-white shadow-inner text-right">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-3 rounded-lg transition-all hover:bg-red-700"
        >
          Logout
        </button>
      </footer>
    </div>
  );
};

export default AdminDashboard;
