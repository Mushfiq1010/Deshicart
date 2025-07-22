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

  const handleRedirectToWallet = async (e) => {
  e.preventDefault();
  const totalAmount = product.PRICE * quantity;

  navigate('/wallet-pay?amount=' + totalAmount +
    '&sellerId=' + product.SELLERID+
    '&productId=' + product.PRODUCTID +
    '&quantity=' + quantity);
  };

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
