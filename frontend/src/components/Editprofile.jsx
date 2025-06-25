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
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-lg w-full p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Edit Seller Profile</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover mb-3 border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-3 flex items-center justify-center text-gray-400 text-sm border">
                No Image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="text"
              value={phone}
              disabled
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Store Name</label>
            <input
              name="storename"
              value={form.storename}
              onChange={handleChange}
              required
              className="input"
              placeholder="Store Name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="input h-24 resize-none"
              placeholder="Store Description"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>

          <button type="submit" className="btn w-full">
            Update Profile
          </button>
        </form>

        <button
          onClick={goToChangePassword}
          className="btn mt-4 w-full bg-gray-500 hover:bg-gray-600"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
