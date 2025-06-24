import React, { useState, useEffect } from "react";
import API from "../../Api"; 


function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products/all"); // This should return all products for customers
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      
      <h2>All Products</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((product) => (
          <li
            key={product.productId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              width: "250px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{product.name}</h3>
            <img
              src={
                product.firstImageUrl
                  ? `http://localhost:5000/uploads/${product.firstImageUrl}`
                  : "/images/photo.png"
              }
              alt={product.name}
              width="100%"
              height="150"
              style={{ objectFit: "cover", borderRadius: "6px" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/photo.png";
              }}
            />
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Quantity:</strong> {product.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllProducts;

