import React, { useEffect, useState } from "react";
import API from "../Api";
import { FaTrash } from "react-icons/fa";

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState("sellers");
  const [sellers, setSellers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const fetchSellers = async () => {
    try {
      const res = await API.get("/admin/users/sellers");
      setSellers(res.data);
    } catch (err) {
      alert("Failed to fetch sellers");
    }
  };

  const [topSellers, setTopSellers] = useState([]);

  const fetchTopSellers = async () => {
    try {
      const res = await API.get("/admin/top-sellers");
      setTopSellers(res.data);
    } catch (err) {
      alert("Failed to fetch top sellers");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/admin/users/customers");
      setCustomers(res.data);
    } catch (err) {
      alert("Failed to fetch customers");
    }
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm("Delete this seller and all products?")) return;
    try {
      await API.delete(`/admin/sellers/${id}`);
      fetchSellers();
    } catch {
      alert("Failed to delete seller");
    }
  };

  useEffect(() => {
    fetchSellers();
    fetchCustomers();
    fetchTopSellers(); 
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      <div className="mb-4">
        <button
          onClick={() => setActiveTab("sellers")}
          className={`px-4 py-2 mr-2 rounded ${activeTab === "sellers" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Sellers
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 rounded ${activeTab === "customers" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Customers
        </button>
      </div>

      {activeTab === "sellers" && (
        <>
  
          
      {topSellers.length > 0 && (
  <div className="max-w-7xl mx-auto mb-10">
<h3 className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 p-4 mb-6 text-center rounded-lg shadow-lg">
  🌟 Top Sellers
</h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {topSellers.map((seller, index) => (
        <div
          key={seller.SELLER_ID}
          className="bg-green-50 border border-green-300 shadow-md rounded-lg p-5 relative"
        >
          <div className="absolute -top-3 -left-3 bg-green-500 text-white font-extrabold px-4 py-2 rounded-full shadow-lg text-xl">
            #{index + 1}
          </div>
     
          <p className="text-gray-800 font-semibold text-center">Store: {seller.STORENAME}</p>
          <p className="text-gray-700 text-center mt-1">Total Products Sold: {seller.TOTAL_SOLD}</p>
          <p className="text-sm text-gray-600 text-center">Seller ID: {seller.SELLERID}</p>
        </div>
      ))}
    </div>
  </div>
)}

        <p className="mb-4 text-lg font-semibold text-indigo-700 text-center bg-indigo-100 rounded py-2 shadow">
            Total Sellers: {sellers.length}
          </p>
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Store</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.USERID} className="text-center">
                  <td className="p-2 border">{s.USERID}</td> 
                  <td className="p-2 border">{s.NAME}</td>
                  <td className="p-2 border">{s.EMAIL}</td>
                  <td className="p-2 border">{s.PHONE}</td>
                  <td className="p-2 border">{s.STORENAME}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDeleteSeller(s.USERID)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === "customers" && (
        <>
          <p className="mb-4 text-lg font-semibold text-indigo-700 text-center bg-indigo-100 rounded py-2 shadow">
            Total Customers: {customers.length}
          </p>
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th> {/* Customer ID */}
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.USERID} className="text-center">
                  <td className="p-2 border">{c.USERID}</td> {/* Customer ID */}
                  <td className="p-2 border">{c.NAME}</td>
                  <td className="p-2 border">{c.EMAIL}</td>
                  <td className="p-2 border">{c.PHONE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ManageUsers;


