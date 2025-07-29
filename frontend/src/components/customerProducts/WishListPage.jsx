import React, { useEffect, useState } from "react";
import API from "../../Api";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa"; // Import wishlist icon

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-teal-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Wishlist Icon */}
          <div className="flex items-center justify-center mb-6">
            <FaHeart className="text-4xl text-red-500 mr-3" /> {/* Wishlist icon */}
            <h2 className="text-3xl font-semibold text-gray-800">My Wishlist</h2>
          </div>

          {wishlist.length === 0 ? (
            <p className="text-center text-gray-600">Your wishlist is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map((product) => (
                <div
                  key={product.PRODUCTID}
                  className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br from-indigo-100 to-teal-100"
                >
                  <img
                    src={product.IMAGEURL || "/images/product-placeholder.jpg"}
                    alt={product.NAME}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-800">
                      {product.NAME}
                    </h3>
                    <p className="text-gray-700 mb-2">৳{product.PRICE}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          navigate(`/customer/products/${product.PRODUCTID}`)
                        }
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-700"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveFromWishlist(product.PRODUCTID)
                        }
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700"
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
      </div>
    </>
  );
};

export default WishlistPage;


