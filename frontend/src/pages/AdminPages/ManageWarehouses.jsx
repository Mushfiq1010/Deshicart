import React, { useState, useEffect } from "react";
import API from "../../Api"; // Your axios instance

const ManageWarehouses = () => {
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [cities, setCities] = useState([]);

  // Fetch cities from backend
  const fetchCities = async () => {
    try {
      const res = await API.get("/admin/cities");
      if (res.data.success) {
        setCities(res.data.cities);
      } else {
        setMessage("❌ Failed to fetch cities.");
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
      setMessage("❌ Server error while fetching cities.");
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    if (!city.trim()) {
      setMessage("❌ City name is required.");
      return;
    }

    try {
      const res = await API.post("/admin/cities", { city });
      if (res.data.success) {
        setMessage("✅ City added successfully!");
        setCity("");
        fetchCities(); // Refresh city list after adding
      } else {
        setMessage("❌ Failed to add city.");
      }
    } catch (err) {
      console.error("Error adding city:", err);
      setMessage("❌ Server error.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        🏙️ Manage Warehouse Cities
      </h2>
      {message && <p className="text-sm text-red-500 mb-3">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
        >
          Add City
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Existing Cities
        </h3>
        {cities.length === 0 ? (
          <p className="text-gray-500">No cities added yet.</p>
        ) : (
          <ul className="list-disc list-inside max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
            {cities.map((c) => (
              <li key={c.cityid} className="text-gray-700">
                {c.city}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageWarehouses;
