import React, { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [form, setForm] = useState({
    name: "",
    storename: "",
    description: "",
  });

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preview, setPreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/seller/getMe");
        const data = res.data;

        setForm({
          name: data.NAME || "",
          storename: data.STORENAME || "",
          description: data.STOREDESCRIPTION || "",
        });

        setEmail(data.EMAIL || "");
        setPhone(data.PHONE || "");
        setPreview(data.PROFILEIMAGE || null);
      } catch (err) {
        console.error(err);
        alert("Failed to load profile info");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("storename", form.storename);
      formData.append("description", form.description);

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      await API.post("/auth/seller/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully!");
      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.response?.data?.error);
    }
  };

  const goToChangePassword = () => {
    navigate("/seller/change-password");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Edit Seller Profile</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Profile Image:</label><br />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "100px", borderRadius: "50%" }}
            />
          )}
          <br />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div>
          <label>Name:</label><br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone:</label><br />
          <input type="text" value={phone} disabled />
        </div>

        <div>
          <label>Store Name:</label><br />
          <input
            name="storename"
            value={form.storename}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description:</label><br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div>
          <label>Email:</label><br />
          <input type="email" value={email} disabled />
        </div>

        <button type="submit" style={{ marginTop: "1rem" }}>
          Update Profile
        </button>
      </form>

      <button onClick={goToChangePassword} style={{ marginTop: "1rem" }}>
        Change Password
      </button>
    </div>
  );
};

export default EditProfile;



