import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../Api";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryid: ""
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const p = res.data;
        setForm({
          name: p.NAME,
          description: p.DESCRIPTION,
          price: p.PRICE,
          quantity: p.QUANTITY,
          categoryid: p.CATEGORYID
        });
      } catch (err) {
        alert("Error fetching product: " + err.response?.data?.error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/products/${id}`, form);
      alert("Product updated successfully!");
      navigate("/seller/products");
    } catch (err) {
      alert("Failed to update product: " + err.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Edit Product</h2>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input" />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="input" />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="input" />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required className="input" />
        <input name="categoryid" placeholder="Category ID" value={form.categoryid} onChange={handleChange} required className="input" />
        <button type="submit" className="btn">Update Product</button>
      </form>
    </div>
  );
};

export default EditProduct;
