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
    localStorage.removeItem("walletToken");
    navigate("/login");
  };

  if (!wallet) return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-600">Welcome to Wallet</h2>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>

        <div className="mb-4">
          <p className="text-lg"><strong>Balance:</strong> <span className="text-green-600">৳{wallet.balance}</span></p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="input"
          />
          <button onClick={deposit} className="btn bg-green-500 hover:bg-green-600">Deposit</button>
          <button onClick={withdraw} className="btn bg-red-500 hover:bg-red-600">Withdraw</button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {wallet.transactions.length === 0 ? (
              <li className="text-gray-500">No transactions found.</li>
            ) : (
              wallet.transactions.map((trx) => (
                <li
                  key={trx.ID}
                  className="p-3 border rounded-lg bg-gray-50 flex justify-between text-sm"
                >
                  <span className={trx.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}>
                    {trx.TYPE} ৳{trx.AMOUNT}
                  </span>
                  <span className="text-gray-500">{new Date(trx.CREATED_AT).toLocaleString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
