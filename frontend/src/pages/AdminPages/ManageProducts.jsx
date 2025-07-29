import React, { useEffect, useState } from "react";
import API from "../../Api";
import { FaTrash } from "react-icons/fa";

const getImageUrl = (url) => {
  if (!url) return "/images/photo.png";
  return url.startsWith("http") ? url : `http://localhost:5000/uploads/${url}`;
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/products");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await API.get("/admin/products/top");
      setTopProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch top products");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/admin/products/${productId}`);
      alert("Deleted successfully");
      fetchProducts();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchTopProducts();
    fetchProducts();
  }, []);

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 min-h-screen px-6 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Manage All Products
      </h2>

      {loading && <p className="text-gray-600 text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && products.length === 0 && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-4xl font-bold text-gray-500">
            No products to show
          </p>
        </div>
      )}

      {topProducts.length > 0 && (
        <div className="max-w-7xl mx-auto mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            🔥 Top Ordered Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProducts.map((product, index) => (
              <div
                key={product.PRODUCTID}
                className="bg-yellow-50 border border-yellow-300 shadow-md rounded-lg p-5 relative"
              >
                <div className="absolute -top-3 -left-3 bg-yellow-500 text-white font-extrabold px-4 py-2 rounded-full shadow-lg text-xl">
                  #{index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {product.NAME}
                </h3>
                <img
                  src={getImageUrl(product.IMAGEURL)}
                  alt={product.NAME}
                  className="w-full h-44 object-cover rounded mb-3"
                />
                <p className="text-gray-800 font-semibold text-center">
                  Seller ID: {product.SELLERID}
                </p>
                <p className="text-gray-700 text-center mt-1">
                  Total Ordered: {product.TOTAL_ORDERS}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Price: ৳{product.PRICE}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
        All Products
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {products.map((product) => (
          <div
            key={product.PRODUCTID}
            className="bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {product.NAME}
              </h3>
              <img
                src={getImageUrl(product.IMAGEURL)}
                alt={product.NAME}
                className="w-full h-48 object-cover rounded mb-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/photo.png";
                }}
              />
              <p className="text-gray-700 mb-1">Price: ৳{product.PRICE}</p>
              <p className="text-sm text-gray-600 mb-1">
                Quantity: {product.QUANTITY}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Seller ID: {product.SELLERID}
              </p>
            </div>
            <button
              onClick={() => handleDelete(product.PRODUCTID)}
              className="bg-red-600 text-white text-center px-4 py-2 rounded hover:bg-red-700 transition mt-2"
            >
              <FaTrash className="inline mr-1" /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
