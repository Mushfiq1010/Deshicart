import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Api";

const WalletPay = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [customerId,setCustomerId] = useState(0);
  const location = useLocation();
  const {
    productId,
    sellerId,
    quantity,
    price,
    subTotal,
    vatAmount,
    total,
    sellerWallet,
    vatRate,
    name,
  } = location.state || {};

  const getSellerWallet = async (sellerId) => {
    try {
      const res = await API.get(`/auth/seller/wallet/${sellerId}`);
      return res.data?.walletUserName || null;
    } catch {
      return null;
    }
  };

  const getCustomer = async() => {
    try{
      const res = await API.get(`/auth/customer/getMe`);
      setCustomerId(res.data.USERID);
    }catch(e){
      console.log(e);
    }
  }
  useEffect(() => {
    if (
      !productId ||
      !sellerId ||
      !quantity ||
      !price ||
      !total ||
      !sellerWallet
    ) {
      alert("Invalid checkout session. Redirecting to products page.");
      navigate("/customer/products");
    }
    getCustomer();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();

    try {
      const trxRes = await fetch(
        "http://localhost:5050/api/wallet/checkout-cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "super-secret-deshicart-to-wallet-key",
          },
          body: JSON.stringify({
            username,
            password,
            transactions: [
              {
                amount: total,
                vatAmount,
                sellerWallet,
              }
            ],
            customerId
          }),
        }
      );

      const trxData = await trxRes.json();
      if (!trxData.success) {
        alert("Transaction failed: " + trxData.message);
        navigate("/customer/products");
        return;
      }

      const payId = trxData.paymentId;

      const payload = {
        cartItems: [
          {
            PRODUCTID: Number(productId),
            QUANTITY: Number(quantity),
            PRICE: Number(price),
            SUBTOTAL: Number(price * quantity),
            vatRate: Number(vatRate),
            vatAmount: Number((price * quantity * vatRate) / 100),
          },
        ],
        isCart: false,
        payId

      };

      const res = await API.post("/customer/placeorder", payload);
      const orderData = res.data;

      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed.");
      }

      alert("✅ Order placed successfully!");
      navigate("/customer/products");
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong during checkout.");
      navigate("/customer/products");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 animate-slide-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Confirm Payment
        </h2>

        <div className="mb-4 text-sm text-gray-600">
          <p>
            <strong>Subtotal:</strong> ৳{subTotal.toFixed(2)}
          </p>
          <p>
            <strong>VAT ({vatRate}%):</strong> ৳{vatAmount.toFixed(2)}
          </p>
          <p className="text-indigo-700 font-bold">
            Total Payable: ৳{total.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handlePay} className="space-y-5">
          <input
            type="text"
            placeholder="Wallet Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Wallet Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="btn w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default WalletPay;
