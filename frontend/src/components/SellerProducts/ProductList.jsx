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
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-pink-100">
      <Navbar userType="seller" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">📦 My Products</h2>
          <button
            onClick={() => navigate("/seller/products/new")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition duration-200 shadow-md hover:shadow-lg"
          >
            ➕ Add New Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-600 mt-20 text-xl">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.productId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 p-5 flex flex-col"
              >
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 truncate">
                  {product.name}
                </h3>
                <img
                  src={product.firstImageUrl || "/images/photo.png"}
                  alt={product.name}
                  className="w-full h-44 object-cover rounded-xl mb-4"
                />
                <p className="text-gray-600 text-sm mb-2 line-clamp-3">{product.description}</p>
                <div className="text-gray-700 text-sm mb-1">
                  <strong>Price:</strong> ৳{product.price}
                </div>
                <div className="text-gray-700 text-sm mb-3">
                  <strong>Quantity:</strong> {product.quantity}
                </div>
                <div className="mt-auto flex gap-2 justify-between pt-3 border-t">
                  <button
                    onClick={() => handleEdit(product.productId)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    🗑 Delete
                  </button>
                  <button
                    onClick={() => handleAnalytics(product.productId)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    📊 Stats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;


