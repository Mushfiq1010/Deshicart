import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../Api";
import Navbar from "../Navbar";

function ProductList() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [form, setForm] = useState({ categoryid: "" });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
    category: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data);
        const rootCategories = res.data.filter(
          (cat) =>
            !cat.parentid ||
            cat.parentid === null ||
            cat.parentid === undefined ||
            cat.parentid === "" ||
            cat.parentid === "null" ||
            cat.parentid === 0
        );
        setAvailableCategories(rootCategories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      resetSelection();
      return;
    }
    const selectedCategory = categories.find(
      (cat) => cat.categoryid == selectedId
    );
    if (!selectedCategory) return;

    const newSelected = [...selectedCategories];
    newSelected[currentLevel] = selectedCategory;
    newSelected.splice(currentLevel + 1);
    setSelectedCategories(newSelected);
    setForm({ ...form, categoryid: selectedId });

    const children = categories.filter((cat) => cat.parentid == selectedId);
    setAvailableCategories(children.length > 0 ? children : []);
    if (children.length > 0) setCurrentLevel(currentLevel + 1);
  };

  const resetSelection = () => {
    setSelectedCategories([]);
    setCurrentLevel(0);
    const rootCategories = categories.filter(
      (cat) =>
        !cat.parentid ||
        cat.parentid === null ||
        cat.parentid === undefined ||
        cat.parentid === "" ||
        cat.parentid === "null" ||
        cat.parentid === 0
    );
    setAvailableCategories(rootCategories);
    setForm({ ...form, categoryid: "" });
  };

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("limit", 12);
      if (name) queryParams.append("name", name);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (form.categoryid) queryParams.append("category", form.categoryid);

      const res = await API.get(`/products?${queryParams.toString()}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, name, refreshKey]);

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
      <Navbar userType="seller" />
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            📦 My Products
          </h2>
          <button
            onClick={() => navigate("/seller/products/new")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            ➕ Add New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 py-8">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg border border-gray-100 min-h-[500px]">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🔍 Filter Products
            </h3>

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">💰 Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="w-1/2 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="w-1/2 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">📂 Category</h4>
              {selectedCategories.length > 0 && (
                <div className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded text-sm mb-2">
                  <span className="text-gray-600">
                    {selectedCategories.map((cat) => cat.name).join(" → ")}
                  </span>
                  <button
                    onClick={resetSelection}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Reset
                  </button>
                </div>
              )}
              {availableCategories.length > 0 && (
                <select
                  value={selectedCategories[currentLevel]?.categoryid || ""}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">
                    {currentLevel === 0
                      ? "Select Main Category"
                      : "Select Subcategory"}
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.categoryid} value={cat.categoryid}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => {
                  setPage(1);
                  fetchProducts();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg mt-2 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="col-span-1 md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.productId}
                className="relative bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-white/20 group"
              >
                <div className="relative overflow-hidden rounded-xl mb-4 h-64">
                  <img
                    src={product.firstImageUrl || "/images/photo.png"}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/photo.png";
                    }}
                  />
                  {product.quantity === 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                      OUT OF STOCK
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      ৳{product.price}
                    </p>
                    <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Qty: {product.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  <button
                    onClick={() => handleEdit(product.productId)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-cyan-600 hover:to-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => handleAnalytics(product.productId)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    📊 Analytics
                  </button>
              
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
