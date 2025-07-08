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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        console.log("Getting categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.categoryid] = cat;
  });

  const getFullCategoryPath = (category) => {
    const path = [];
    let current = category;
    while (current) {
      path.unshift(current.name);
      current = categoryMap[current.parentid];
    }
    return path.join(" → ");
  };



  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  // Helper to format category names with hierarchy
  const renderCategoryOptions = (categories, parentId = null) => {
    return categories
      .filter((cat) => cat.parentid === parentId)
      .map((cat) => (
        <React.Fragment key={cat.categoryid}>
          <option value={cat.categoryid}>{getFullCategoryPath(cat)}</option>
          {renderCategoryOptions(categories, cat.categoryid)}
        </React.Fragment>
      ));
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Add New Product</h2>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required className="input" />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="input" />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="input" />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required className="input" />

        <select name="categoryid" value={form.categoryid} onChange={handleChange} required className="input">
          <option value="">Select Category</option>
          {renderCategoryOptions(categories)}
        </select>


        <input type="file" name="images" accept="image/*" multiple onChange={handleFileChange} className="input" />
        <button type="submit" className="btn">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;
