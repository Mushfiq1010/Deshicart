import React, { useEffect, useState } from "react";
import API from "../../Api";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await API.get("/customer/wishlist");
        setWishlist(res.data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await API.delete(`/customer/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => p.PRODUCTID !== productId));
      alert("Removed from wishlist");
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      alert("Failed to remove from wishlist");
    }
  };

  return (
    <>
      <Navbar userType="customer" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold mb-6">My Wishlist</h2>

        {wishlist.length === 0 ? (
          <p className="text-gray-600">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div
                key={product.PRODUCTID}
                className="bg-white shadow-md rounded-xl overflow-hidden"
              >
                <img
                  src={product.IMAGEURL || "/images/product-placeholder.jpg"}
                  alt={product.NAME}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{product.NAME}</h3>
                  <p className="text-gray-700 mb-2">৳{product.PRICE}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/customer/products/${product.PRODUCTID}`)
                      }
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      View Product
                    </button>
                    <button
                      onClick={() =>
                        handleRemoveFromWishlist(product.PRODUCTID)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
