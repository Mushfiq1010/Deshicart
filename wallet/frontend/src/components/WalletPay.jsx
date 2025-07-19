import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

const WalletPay = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");
  const sellerWallet = searchParams.get("sellerWallet");
  const redirectUri = decodeURIComponent(searchParams.get("redirect_uri"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();

    const amountParam = parseFloat(amount);
    if (isNaN(amountParam)) {
      alert("Invalid payment amount");
      return;
    }

    const authRes = await fetch("http://localhost:5050/api/auth/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const authData = await authRes.json();
    if (!authData.success) {
      alert("Invalid wallet credentials");
      return;
    }

    localStorage.setItem("walletToken", authData.token);

    const debitRes = await fetch("http://localhost:5050/api/wallet/trx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({
        amount: amountParam,
        sender: username,
        receiver: sellerWallet,
      }),
    });

    const debitData = await debitRes.json();
    if (!debitData.success) {
      alert("Transaction failed: " + debitData.message);
      return;
    }

    alert("✅ Payment successful!");
    window.location.href = redirectUri;
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
