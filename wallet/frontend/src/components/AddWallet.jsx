import React, { useState, useEffect } from "react";
import API from "../api";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const uri = searchParams.get("redirect_uri");
    if (uri) {
      setRedirectUri(uri);
    } else {
      alert("Missing redirect_uri");
    }
  }, [searchParams]);

  const handleAuth = async () => {
    try {
      const res = await API.post("/auth/authenticate", { username, password });
      
      if (redirectUri && res.data.success) {
        const safeRedirect = decodeURIComponent(redirectUri);
        const redirectWithUsername = `${safeRedirect}?walletUsername=${encodeURIComponent(username)}`;
        window.location.href = redirectWithUsername;
      } else {
        window.location.href = decodeURIComponent(redirectUri);
      }
    } catch (err) {
      alert("Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Wallet</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
