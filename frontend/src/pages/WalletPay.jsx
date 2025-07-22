import React, { useEffect, useState } from "react";
import API from "../Api";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";

const WalletPay = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const quantity = searchParams.get("quantity");
  const [sellerWallet, setSellerWallet] = useState("");
  const amount = searchParams.get("amount");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const fetchSellerWallet = async (sellerId) => {
    try {
      const res = await API.get(`/auth/seller/wallet/${sellerId}`);
      if (!res.data || !res.data.walletUserName) {
        alert("Seller wallet not found. Please contact support.");
        navigate("/customer/products");
        return;
      }
      setSellerWallet(res.data.walletUserName);
    } catch (err) {
      console.error("Error fetching seller wallet:", err);
      if (err.response?.status === 404) {
        alert("Seller wallet not found. Please contact support.");
      } else {
        alert("Error fetching seller wallet. Please try again later.");
      }
      navigate("/customer/products");
    }
  };

  useEffect(() => {
    fetchSellerWallet(searchParams.get("sellerId"));
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();

    const amountParam = parseFloat(amount);
    if (isNaN(amountParam)) {
      alert("Invalid payment amount");
      return;
    }

    const trxRes = await fetch("http://localhost:5050/api/wallet/trx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":'super-secret-deshicart-to-wallet-key',
      },
      body: JSON.stringify({
        amount: amountParam,
        sender: username,
        password,
        receiver: sellerWallet,
      }),
    });

    const trxData = await trxRes.json();
    if (!trxData.success) {
      alert("Transaction failed: " + trxData.message + ". Redirecting to DeshiCart...");
      navigate("/customer/products");
      return;
    }
    
      const payload = {
      productId: Number(productId),
      quantity: Number(quantity),
      price: Number(amount),
     };
      const res = await API.post("/orders/add", payload);
     const orderId = res.data.orderId;
    
    
    navigate("/customer/products");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 animate-slide-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Confirm Payment
        </h2>
        <p className="text-center text-gray-600 mb-8">
          You're about to pay <span className="font-semibold text-indigo-600">৳{amount}</span>
        </p>
        <form onSubmit={handlePay} className="space-y-5">
          <input
            type="text"
            placeholder="Wallet Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Wallet Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button
            type="submit"
            className="btn bg-green-600 hover:bg-green-700"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default WalletPay;
