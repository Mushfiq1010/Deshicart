import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";
import Rating from "react-rating";

function AllProducts() {
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

        const rootCategories = res.data.filter((cat) => {
          const isRoot =
            !cat.parentid ||
            cat.parentid === null ||
            cat.parentid === undefined ||
            cat.parentid === "" ||
            cat.parentid === "null" ||
            cat.parentid === 0;
          return isRoot;
        });

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
    const rootCategories = categories.filter((cat) => {
      const isRoot =
        !cat.parentid ||
        cat.parentid === null ||
        cat.parentid === undefined ||
        cat.parentid === "" ||
        cat.parentid === "null" ||
        cat.parentid === 0;
      return isRoot;
    });
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

      const res = await API.get(`/products/all?${queryParams.toString()}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, name]);

  const getImageUrl = (url) => {
    if (!url) return "/images/photo.png";
    return url.startsWith("http")
      ? url
      : `http://localhost:5000/uploads/${url}`;
  };

  const handleAddToCart = async (productId) => {
    try {
      const quantity = 1;
      const res = await API.post("/customer/addcart", {
        productId,
        quantity,
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
    navigate(`/order/${id}`);
  };

  const handleCartClick = () => {
    navigate("/customer/cart");
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const res = await API.post("/customer/wishlist/add", { productId });
      alert("✅ Added to wishlist!");
    } catch (err) {
      console.error("Wishlist error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(`⚠️ ${err.response.data.message}`);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 min-h-screen">
      <Navbar userType="customer" />

      <div
        className="fixed top-4 right-4 p-4 bg-indigo-600 text-white rounded-full cursor-pointer"
        onClick={handleCartClick}
      >
        <ShoppingCartIcon className="h-6 w-6" />
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

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex flex-wrap">
            {"Explore All Products".split("").map((char, index) => (
              <span
                key={index}
                className="inline-block opacity-0 animate-slide-in"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "forwards",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>

          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.productId}
                className="relative bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg flex flex-col justify-between overflow-hidden"
              >
                {/* Add to Wishlist Button - Top Right */}
                <button
                  onClick={() => handleAddToWishlist(product.productId)}
                  className="absolute top-3 right-3 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md transition-all duration-300 z-10"
                >
                  Add to Wishlist
                </button>

                {/* Add top padding to prevent overlap */}
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {product.name}
                  </h3>

                  {product.averageRating && (
                <p className="text-yellow-600 font-medium text-sm mb-4">
                  ⭐ {product.averageRating.toFixed(1)} / 5 
                </p>
              )}

              {!product.averageRating && (
                <p className="text-yellow-600 font-medium text-sm mb-4">
                   ⭐ N/A
                </p>
              )}


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

                  {/* Price & Stock Out Row */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Price: ৳{product.price}
                    </p>
                    {product.quantity === 0 && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        STOCK OUT
                      </span>
                    )}
                  </div>

                  {/* View Product Button */}
                  <Link
                    to={`/customer/products/${product.productId}`}
                    className="w-full text-center bg-gradient-to-r from-green-400 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white font-semibold py-2 px-4 rounded transition-all duration-500 ease-in-out transform hover:-translate-y-1 mb-2 block"
                  >
                    View Product
                  </Link>

                  {/* Cart & Order Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleAddToCart(product.productId)}
                      disabled={product.quantity === 0}
                      className={`w-full sm:w-1/2 text-center py-2 px-4 rounded font-semibold transition-all duration-500 ease-in-out transform ${
                        product.quantity === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white hover:-translate-y-1"
                      }`}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleOrderNow(product.productId)}
                      disabled={product.quantity === 0}
                      className={`w-full sm:w-1/2 text-center py-2 px-4 rounded font-semibold transition-all duration-500 ease-in-out transform ${
                        product.quantity === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white hover:-translate-y-1"
                      }`}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-indigo-500 text-white rounded disabled:bg-gray-300"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-700">Page {page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-indigo-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllProducts;
