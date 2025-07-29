import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";
import Navbar from "../Navbar";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  const handleEdit = (id) => navigate(`/seller/products/edit/${id}`);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setRefreshKey((prev) => prev + 1);
      alert("Product deleted successfully!");
    } catch (err) {
      alert("Failed to delete product: " + err.response?.data?.error);
    }
  };

  const handleAnalytics = (id) => navigate(`/seller/products/analytics/${id}`);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 min-h-screen">
      <Navbar userType="seller"/>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">My Products</h2>
          <button
            onClick={() => navigate("/seller/products/new")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
          >
            Add New Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.productId} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
              <img
                src={product.firstImageUrl || "/images/photo.png"}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <p className="text-gray-700 mb-1">{product.description}</p>
              <p className="text-sm text-gray-600">Price: ৳{product.price}</p>
              <p className="text-sm text-gray-600 mb-3">Quantity: {product.quantity}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product.productId)}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.productId)}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleAnalytics(product.productId)}
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
