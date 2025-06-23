import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api"; // axios instance

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryid: "",
  });

  const [images, setImages] = useState([]); // For storing selected image files

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setImages([...e.target.files]); // support multiple image selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    for (const key in form) {
      formData.append(key, form[key]);
    }

    images.forEach((image) => {
      formData.append("images", image); // "images" must match backend field name (req.files)
    });

    try {
      await API.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product added successfully!");
      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      alert("Failed to add product: " + err.response?.data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
      <h2>Add New Product</h2>

      <input
        name="name"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <br />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <br />

      <input
        name="price"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
      />
      <br />

      <input
        name="quantity"
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        required
      />
      <br />

      <input
        name="categoryid"
        placeholder="Category ID"
        value={form.categoryid}
        onChange={handleChange}
        required
      />
      <br />

      <input
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <br />

      <button type="submit">Add Product</button>
    </form>
  );
}

export default AddProduct;


