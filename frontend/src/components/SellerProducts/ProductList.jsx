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
    if (children.length > 0) {
      setAvailableCategories(children);
      setCurrentLevel(currentLevel + 1);
    } else {
      setAvailableCategories([]);
    }
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
      setProducts(res.data.products); // <-- This was missing
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
      </div>

      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8">
        <div className="w-full md:w-1/4">
          <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-white shadow rounded-lg p-4"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {product.name}
              </h3>
              <img
                src={product.firstImageUrl || "/images/photo.png"}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/photo.png";
                }}
              />
              <p className="text-gray-700 mb-1">{product.description}</p>
              <p className="text-sm text-gray-600">Price: ৳{product.price}</p>
              <p className="text-sm text-gray-600 mb-3">
                Quantity: {product.quantity}
              </p>
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
