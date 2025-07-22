import React, { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

const CartPay = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [transactionRequests, setTransactionRequests] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const navigate = useNavigate();

  const apiKey = 'super-secret-deshicart-to-wallet-key';

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) processCartItems();
  }, [cartItems]);

  // Countdown timer with auto timeout
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Session expired due to inactivity.");
          navigate("/customer/products");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCartItems = async () => {
    try {
      const res = await API.get("/customer/getcart");
      if (res.data.cart) setCartItems(res.data.cart);
      else if (Array.isArray(res.data)) setCartItems(res.data);
    } catch (err) {
      alert("Failed to load cart items. Please try again later.");
      navigate("/customer/products");
    }
  };

  const getProduct = async (id) => {
    try {
      const res = await API.get(`/products/${id}`);
      return res.data;
    } catch {
      return null;
    }
  };

  const getSellerWallet = async (sellerId) => {
    try {
      const res = await API.get(`/auth/seller/wallet/${sellerId}`);
      return res.data?.walletUserName || null;
    } catch {
      return null;
    }
  };

  const processCartItems = async () => {
    let total = 0;
    const list = await Promise.all(
      cartItems.map(async (item) => {
        const product = await getProduct(item.PRODUCTID);
        if (!product) return null;

        const sellerWallet = await getSellerWallet(product.SELLERID);
        if (!sellerWallet) return null;

        const amount = product.PRICE * item.QUANTITY;
        total += amount;

        return {
          amount,
          sellerWallet,
          productId: item.PRODUCTID,
          quantity: item.QUANTITY,
          price: product.PRICE,
          name: product.NAME,
        };
      })
    );

    const validList = list.filter(item => item !== null);
    if (validList.length === 0) {
      alert("Cart contains invalid products or sellers.");
      navigate("/customer/products");
      return;
    }

    setTransactionRequests(validList);
    setTotalAmount(total);
  };

  const handlePay = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5050/api/wallet/checkout-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          username,
          password,
          transactions: transactionRequests
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert("Transaction failed: " + data.message);
        navigate("/customer/products");
        return;
      }

      const orderRes = await API.post("/customer/placeorder");
      if (!orderRes.data.success) {
        alert("Order could not be created.");
        navigate("/customer/products");
        return;
      }

      alert("Order placed successfully!");
      navigate("/customer/products");
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Something went wrong during payment.");
      navigate("/customer/products");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 animate-slide-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Confirm Payment
        </h2>
        <p className="text-center text-gray-600 mb-2">
          You're about to pay <span className="font-semibold text-indigo-600">৳{totalAmount}</span>
        </p>
        <p className="text-center text-red-500 font-medium mb-6">
          Session expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        <form onSubmit={handlePay} className="space-y-5">
          <input
            type="text"
            placeholder="Wallet Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Wallet Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
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

export default CartPay;
