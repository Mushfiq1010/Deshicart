import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";

function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryid: "",
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        console.log("Raw categories data:", res.data);
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
        
        console.log("Root categories found:", rootCategories);
        setAvailableCategories(rootCategories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
  const selectedId = e.target.value;
  console.log("Category selected:", selectedId);

  if (!selectedId) {
    resetSelection();
    return;
  }

  const selectedCategory = categories.find(cat => cat.categoryid == selectedId);
  if (!selectedCategory) {
    console.error("Category not found");
    return;
  }

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.categoryid) {
      alert("Please select a final category");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    images.forEach((img) => formData.append("images", img));

    try {
      await API.post("/products/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product added successfully!");
      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      alert("Failed to add product: " + err.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Add New Product</h2>
        
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />

       
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Category (Level {currentLevel + 1})
          </label>
          
          
          {selectedCategories.length > 0 && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm text-gray-600">
                {selectedCategories.map(cat => cat.name).join(" → ")}
              </span>
              <button
                type="button"
                onClick={resetSelection}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Reset
              </button>
            </div>
          )}

         
          {availableCategories.length > 0 && (
            <select
              value={selectedCategories[currentLevel]?.categoryid || ""}
              onChange={handleCategoryChange}
              className="w-full p-2 border border-gray-300 rounded"
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
              ✓ Final category selected: {selectedCategories[selectedCategories.length - 1]?.name}
            </div>
          )}
        </div>

        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct;