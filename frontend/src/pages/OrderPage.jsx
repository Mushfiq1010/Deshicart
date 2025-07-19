import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../Api";


const OrderPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [walletUser, setWalletUser] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setLoading(false);
      }
    };
    
    fetchProduct();
    
  }, [id]);

  useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setLoading(false);
      
      // Fetch seller wallet after product is loaded
      if (res.data.SELLERID) {
        await fetchSellerWallet(res.data.SELLERID);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setLoading(false);
    }
  };
  
  const fetchSellerWallet = async (sellerId) => {
    try {
      console.log('Fetching wallet for seller ID:', sellerId);
      
      // Fix: Remove the colon (:) from the URL
      const res = await API.get(`/auth/seller/wallet/${sellerId}`);
      
      if (!res.data || !res.data.walletUserName) {
        alert("Seller wallet not found. Please contact support.");
        navigate("/customer/products");
        return;
      }
      
      setWalletUser(res.data.walletUserName);
      
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
  
  fetchProduct();
}, [id]);

  const handleRedirectToWallet = async (e) => {
  e.preventDefault();

  const totalAmount = product.PRICE * quantity;

  const redirectUri = encodeURIComponent(
    `http://localhost:3000/payment-success?productId=${product.PRODUCTID}&quantity=${quantity}&price=${product.PRICE}`
    );

  window.location.href = window.location.href = `http://localhost:4200/wallet-pay?sellerWallet=${walletUser}&amount=${totalAmount}&redirect_uri=${redirectUri}&productId=${product.PRODUCTID}&quantity=${quantity}&price=${product.PRICE}`;

  };

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: product.PRODUCTID,
        quantity,
        price: product.PRICE,
      };

      await API.post("/orders/add", payload);
      alert("Order placed successfully!");
      navigate("/customer/products");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert("Order failed. Please try again.");
    }
  }; */

  if (loading) return <p className="text-center mt-8">Loading product...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4 text-indigo-800">Place Your Order</h1>

      <div className="mb-6">
        <p className="text-lg font-semibold">{product.NAME}</p>
        <p className="text-sm text-gray-600 mb-1">Price: ৳{product.PRICE}</p>
        <p className="text-sm text-gray-600">
          Available Quantity: {product.QUANTITY}
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label htmlFor="quantity" className="block font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={product.QUANTITY}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>

        <p className="text-md text-orange-600 font-semibold">
          Total: ৳{(quantity * product.PRICE).toFixed(2)}
        </p>

        <button
  type="button"
  disabled={quantity > product.QUANTITY}
  onClick={handleRedirectToWallet}
  className={`w-full py-2 rounded-lg text-white font-semibold transition ${
    quantity <= product.QUANTITY
      ? "bg-orange-500 hover:bg-orange-600"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Confirm Order & Pay
</button>

      </form>

      <Link
        to={`/customer/products/${product.PRODUCTID}`}
        className="block text-center text-sm text-indigo-600 mt-6 hover:underline"
      >
        ← Back to Product
      </Link>
    </div>
  );
};

export default OrderPage;
