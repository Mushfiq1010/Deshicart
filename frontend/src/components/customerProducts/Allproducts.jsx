import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

function AllProducts() {
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
    category: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data);

        const rootCategories = res.data.filter(cat => {
          const isRoot = !cat.parentid || 
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

    const selectedCategory = categories.find(cat => cat.categoryid == selectedId);
    if (!selectedCategory) return;

    const newSelected = [...selectedCategories];
    newSelected[currentLevel] = selectedCategory;
    newSelected.splice(currentLevel + 1);
    setSelectedCategories(newSelected);

    
    setForm({ ...form, categoryid: selectedId });

    const children = categories.filter(cat => cat.parentid == selectedId);
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
    const rootCategories = categories.filter(cat => {
      const isRoot = !cat.parentid || 
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

      if (filters.name) queryParams.append("name", filters.name);
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
  }, [form.categoryid, filters.name, filters.minPrice, filters.maxPrice, page]);

  const getImageUrl = (url) => {
    if (!url) return "/images/photo.png";
    return url.startsWith("http") ? url : `http://localhost:5000/uploads/${url}`;
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
    navigate(`/order/${id}`);
  };

  const handleCartClick = () => {
    navigate("/customer/cart"); 
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 min-h-screen">
      <Navbar userType="customer" />

      <div className="fixed top-4 right-4 p-4 bg-indigo-600 text-white rounded-full cursor-pointer" onClick={handleCartClick}>
        <ShoppingCartIcon className="h-6 w-6" />
      </div>

      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8">
  <div className="w-full md:w-1/4">
    <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Search & Filter</h3>

      <div className="flex flex-col gap-4">
        
        <input
          type="text"
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

       
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Category (Level {currentLevel + 1})
          </label>

          {selectedCategories.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 p-2 rounded-md text-indigo-700 text-sm">
              <span>{selectedCategories.map((cat) => cat.name).join(" → ")}</span>
              <button
                type="button"
                onClick={resetSelection}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
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
              required
            >
              <option value="">
                {currentLevel === 0 ? "Select Main Category" : "Select Subcategory"}
              </option>
              {availableCategories.map((cat) => (
                <option key={cat.categoryid} value={cat.categoryid}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {form.categoryid && (
            <div className="text-sm text-green-600">
              ✓ Selected category: {selectedCategories[selectedCategories.length - 1]?.name || "(parent category)"}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>


        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex flex-wrap">
  {"Explore All Products".split("").map((char, index) => (
    <span
      key={index}
      className="inline-block opacity-0 animate-slide-in"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ))}
</h2>

          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
  <div key={product.productId} className="bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg flex flex-col justify-between">
    <div>
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
      <p className="text-sm text-gray-600 mb-4">Price: ৳{product.price}</p>
    </div>

   
    <Link
      to={`/customer/products/${product.productId}`}
      className="w-full text-center bg-gradient-to-r from-green-400 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white font-semibold py-2 px-4 rounded transition-all duration-500 ease-in-out transform hover:-translate-y-1 mb-2"
    >
      View Product
    </Link>

   
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={() => handleAddToCart(product.productId)}
        className="w-full sm:w-1/2 text-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold py-2 px-4 rounded transition-all duration-500 ease-in-out transform hover:-translate-y-1"
      >
        Add to Cart
      </button>
      <button
        onClick={() => handleOrderNow(product.productId)}
        className="w-full sm:w-1/2 text-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold py-2 px-4 rounded transition-all duration-500 ease-in-out transform hover:-translate-y-1"
      >
        Order Now
      </button>
    </div>
  </div>
))}
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-indigo-500 text-white rounded disabled:bg-gray-300">Prev</button>
            <span className="px-3 py-1 text-gray-700">Page {page}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-indigo-500 text-white rounded disabled:bg-gray-300">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllProducts;
