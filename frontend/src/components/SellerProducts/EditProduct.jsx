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
        if (res.data.length === 0) return alert("Product not found");
        const p = res.data[0]; // Oracle may return array
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
      <h2>Edit Product</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <br />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <br />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
      <br />
      <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
      <br />
      <input name="categoryid" placeholder="Category ID" value={form.categoryid} onChange={handleChange} required />
      <br />
      <button type="submit">Update Product</button>
    </form>
  );
};

export default EditProduct;
