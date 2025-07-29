import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";

const Navbar = ({ userType }) => {
  const [profile, setProfile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get(`/auth/${userType}/getMe`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      alert("Logged out successfully");
      navigate("/");
    } catch (err) {
      alert("Logout failed");
    }
  };

  const handleSearch = () => {
    navigate(`/${userType}/products?name=${encodeURIComponent(searchText)}`);
  };

  return (
    <div className="w-full bg-indigo-700 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        DeshiCart
      </h1>

      <div className="flex flex-1 mx-6">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-2 rounded-l-md text-black"
        />
        <button
          onClick={handleSearch}
          className="bg-yellow-400 text-black px-4 py-2 rounded-r-md"
        >
          Search
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/${userType}/orders`)}
          className="hover:underline"
        >
          Orders
        </button>

        {userType === "customer" && (
          <>
            <button
              onClick={() => navigate("/customer/cart")}
              className="hover:underline"
            >
              Cart
            </button>
            <button
              onClick={() => navigate("/customer/wishlist")}
              className="hover:underline"
            >
              Wishlist
            </button>
          </>
        )}

        {profile && (
          <div
            onClick={() => navigate(`/${userType}/edit-profile`)}
            className="flex items-center cursor-pointer hover:bg-indigo-600 px-3 py-1 rounded"
          >
            <img
              src={profile.PROFILEIMAGE || "/images/placeholder.jpg"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
            <span className="font-medium">{profile.NAME}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
