import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";

const Navbar = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/auth/seller/getMe");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    loadProfile();
  }, []);

  return (
    <div
      className="navbar"
      style={{
        padding: "10px",
        display: "flex",
        justifyContent: "flex-end",
        borderBottom: "1px solid #ccc",
      }}
    >
      {profile && (
        <div
          onClick={() => navigate("/seller/edit-profile")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <img
            src={profile.PROFILEIMAGE || "/images/placeholder.jpg"}
            alt="Profile"
            width="40"
            height="40"
            style={{ borderRadius: "50%", marginRight: "8px" }}
          />
          <span>{profile.NAME}</span>
        </div>
      )}
    </div>
  );
};

export default Navbar;




