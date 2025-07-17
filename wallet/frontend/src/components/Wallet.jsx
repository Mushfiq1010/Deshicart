import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const fetchWallet = async () => {
    const res = await API.get("/wallet");
    setWallet(res.data);
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const deposit = async () => {
    await API.post("/wallet/deposit", { amount: parseFloat(amount) });
    fetchWallet();
  };

  const withdraw = async () => {
    try {
      await API.post("/wallet/withdraw", { amount: parseFloat(amount) });
      fetchWallet();
    } catch (e) {
      alert("Withdrawal failed: " + e.response?.data?.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!wallet) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome to Wallet</h2>
      <p><strong>Balance:</strong> ৳{wallet.balance}</p>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw}>Withdraw</button>

      <h3>Transaction History</h3>
      <ul>
        {wallet.transactions.map((trx) => (
          <li key={trx.id}>
            {trx.type} ৳{trx.amount} at {new Date(trx.created_at).toLocaleString()}
          </li>
        ))}
      </ul>

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Wallet;
