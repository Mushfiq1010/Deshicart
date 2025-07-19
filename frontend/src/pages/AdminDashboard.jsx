import React from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 shadow">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </header>

      <main className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-600 mb-4">View or remove sellers and customers.</p>
            <button onClick={goToUsers} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              Go to Users
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
            <p className="text-gray-600 mb-4">Approve or remove listed products.</p>
            <button onClick={goToProducts} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              Go to Products
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-2">View Reports</h3>
            <p className="text-gray-600 mb-4">Check sales, user stats, and more.</p>
            <button onClick={goToReports} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              View Reports
            </button>
          </div>
              <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Manage Categories</h3>
            <p className="text-gray-600 mb-4">Create, edit, or delete product categories.</p>
            <button onClick={gotoCategories} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              Go to Categories
            </button>
          </div>
        </div>

        
      </main>

      <footer className="p-4 bg-white shadow-inner text-right">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </footer>
    </div>
  );
};

export default AdminDashboard;
