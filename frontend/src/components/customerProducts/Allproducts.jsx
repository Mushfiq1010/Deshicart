import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";
import Navbar from "../Navbar";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
    category: ""
  });

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.name) queryParams.append("name", filters.name);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (filters.category) queryParams.append("category", filters.category);

      const res = await API.get(`/products/all?${queryParams.toString()}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products/all");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "/images/photo.png";
    return url.startsWith("http") ? url : `http://localhost:5000/uploads/${url}`;
  };

  const handleViewProduct = (id) => {
    console.log("Viewing product", id);
  };

  const handleAddToCart = async (productId) => {
    try {
      const quantity = 1;
      const res = await API.post("/customer/addcart", {
        productId,
        quantity
      });

      if (res.status === 200) {
        alert("✅ Added to cart!");
      } else {
        alert("❌ Failed to add to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart", err);
      alert("❌ Error adding to cart.");
    }
  };

  const handleOrderNow = (id) => {
    console.log("Order placed for", id);
  };

  const handleCartClick = () => {
    navigate("/customer/cart"); // ✅ Go to /cart page
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 min-h-screen">
      <Navbar />

      {/* Cart Icon */}
      <div
        className="fixed top-4 right-4 p-4 bg-indigo-600 text-white rounded-full cursor-pointer"
        onClick={handleCartClick}
      >
        <ShoppingCartIcon className="h-6 w-6" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Category ID"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Explore All Products</h2>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
              <img
                src={getImageUrl(product.firstImageUrl)}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/photo.png";
                }}
              />
              <p className="text-gray-700 mb-1">{product.description}</p>
              <p className="text-sm text-gray-600 mb-2">Price: ${product.price}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleViewProduct(product.productId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  View Product
                </button>
                <button
                  onClick={() => handleAddToCart(product.productId)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleOrderNow(product.productId)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllProducts;


