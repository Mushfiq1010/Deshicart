import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api"; 

function ProductList() {
  const [products, setProducts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate(); // To redirect if needed

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products"); // Assuming your API fetches the logged-in seller's products
        setProducts(res.data); // Set fetched products into state
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  const handleEdit = (id) => {
    navigate(`/seller/products/edit/${id}`);
    
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setRefreshKey(prev => prev + 1);
      alert("Product deleted successfully!");
    } catch (err) {
      alert("Failed to delete product: " + err.response?.data?.error);
    }
  };

  return (
    <div>
      <h2>My Products</h2>
      <button onClick={() => navigate("/seller/products/new")}>Add New Product</button>
<ul>
  {products.map((product) => (
    <li key={product.productId}>
      <h3>{product.name}</h3>
      <img
        src={product.firstImageUrl || "https://via.placeholder.com/150"}
        alt={product.name}
        width="150"
        height="150"
        style={{ objectFit: "cover", borderRadius: "8px" }}
      />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Quantity: {product.quantity}</p>
      <button onClick={() => handleEdit(product.productId)}>Edit</button>
      <button onClick={() => handleDelete(product.productId)}>Delete</button>
    </li>
  ))}
</ul>

    </div>
  );
}

export default ProductList;
