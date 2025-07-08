import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";

const Navbar = ({userType}) => {
  const [profile, setProfile] = useState(null);
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

  return (
    <div className="w-full bg-white border-b shadow-sm px-6 py-3 flex justify-between items-center">
      <h1
        className="text-xl font-bold text-indigo-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        DeshiCart
      </h1>

      {profile && (
        <div className="flex items-center space-x-4">
          <div
            onClick={() => navigate(`/${userType}/edit-profile`)}
            className="flex items-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded transition"
          >
            <img
              src={profile.PROFILEIMAGE || "/images/placeholder.jpg"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover mr-2"
            />
            <span className="font-medium text-gray-800">{profile.NAME}</span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded shadow transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
