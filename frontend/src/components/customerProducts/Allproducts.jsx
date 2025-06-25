import React, { useState, useEffect } from "react";
import API from "../../Api";
import Navbar from "../Navbar";

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

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 min-h-screen">
      <Navbar />
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
              <p className="text-sm text-gray-600">Price: ${product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllProducts;
