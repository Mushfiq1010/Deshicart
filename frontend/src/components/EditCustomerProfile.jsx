import React, { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

const EditCustomerProfile = () => {
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
        const res = await API.get("/auth/customer/getMe");
        const data = res.data;

        setForm({
          name: data.NAME || ""
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

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      await API.post("/auth/customer/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully!");
      navigate("/customer/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600">Edit Customer Profile</h2>

        {/* Profile Image Section */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center space-y-2">
            {preview ? (
              <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* Personal Info */}
        <div className="border p-6 rounded-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Info</h3>

          <div className="grid grid-cols-1 gap-4">
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
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="input bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <button type="submit" onClick={handleSubmit} className="btn w-full mt-4">
          Update Profile
        </button>

        <button
          onClick={() => navigate("/customer/change-password")}
          className="btn w-full mt-2 bg-gray-500 hover:bg-gray-600"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default EditCustomerProfile;
