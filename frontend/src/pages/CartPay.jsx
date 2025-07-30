import React, { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate, useLocation } from "react-router-dom";

const CartPay = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactionRequests, setTransactionRequests] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180);
  const navigate = useNavigate();
  const location = useLocation();
  const [customerId,setCustomerId] = useState(0);
  const apiKey = "super-secret-deshicart-to-wallet-key";

  const passedCartItems = location.state?.cartItems || [];
  const passedVatTotal = location.state?.vatTotal || 0;

  const [cartItems, setCartItems] = useState([]);
  const [vatTotal, setVatTotal] = useState(0);

  const get = (item, key) =>
    item[key] ?? item[key.toUpperCase()] ?? item[key.toLowerCase()] ?? 0;


  const getCustomer = async() => {
    try{
      const res = await API.get(`/auth/customer/getMe`);
      setCustomerId(res.data.USERID);
    }catch(e){
      console.log(e);
    }
  }
  useEffect(() => {
    getCustomer();
    setCartItems(passedCartItems);
    setVatTotal(passedVatTotal);
    processCartItems(passedCartItems);
    
  }, []);

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

  /* const fetchCartAndProcess = async () => {
    try {
      const res = await API.get("/customer/getcart");
      const rawCart = res.data.cart || res.data || [];
      setCartItems(rawCart);
      await processCartItems(rawCart);
    } catch (err) {
      alert("Failed to load cart. Redirecting...");
      navigate("/customer/products");
    }
  }; */

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

  const processCartItems = async (items) => {
    let total = 0;
    let totalVat = 0;

    const list = await Promise.all(
      items.map(async (item) => {
        const sellerWallet = item.SELLERWALLETID;

        const price = get(item, "price");
        const quantity = get(item, "quantity");

        let vatRate = item.vatRate || 0;

        const vatAmount = (price * quantity * vatRate) / 100;
        const amount = price * quantity;

        total += amount;
        totalVat += vatAmount;

        return {
          amount,
          vatAmount,
          sellerWallet,
        };
      })
    );

    const validTransactions = list.filter(Boolean);

    if (validTransactions.length === 0) {
      alert("Invalid cart contents. Please try again.");
      navigate("/customer/products");
      return;
    }

    setTransactionRequests(validTransactions);
    setTotalAmount(total + totalVat); 
    setVatTotal(totalVat);
  };

  const handlePay = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "http://localhost:5050/api/wallet/checkout-cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            customerId,
            username,
            password,
            transactions: transactionRequests,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert("Transaction failed: " + data.message);
        navigate("/customer/products");
        return;
      }
      const payId = data.paymentId;
      const orderRes = await API.post("/customer/placeorder", {
        cartItems,
        vatTotal,
        payId,
        isCart: true,
      });

      if (!orderRes.data.success) {
        alert("Order could not be created.");
        navigate("/customer/products");
        return;
      }

      alert("✅ Order placed successfully!");
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
          You're about to pay{" "}
          <span className="font-semibold text-indigo-600">
            ৳{totalAmount.toFixed(2)}
          </span>
        </p>
        <p className="text-center text-red-500 font-medium mb-6">
          Session expires in: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
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
          <button type="submit" className="btn bg-green-600 hover:bg-green-700">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default CartPay;
