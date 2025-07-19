import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../Api";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hasPlacedOrder = useRef(false); 

  const productId = searchParams.get("productId");
  const quantity = searchParams.get("quantity");
  const price = searchParams.get("price");

  useEffect(() => {
    const placeOrder = async () => {
      if (hasPlacedOrder.current) return; // already placed
      hasPlacedOrder.current = true;

      try {
        const payload = {
          productId: Number(productId),
          quantity: Number(quantity),
          price: Number(price),
        };

        await API.post("/orders/add", payload);
        alert("Payment successful & Order placed!");
        navigate("/customer/products");
      } catch (err) {
        console.error("Order after payment failed:", err.response?.data || err.message);
        alert("Payment received, but order placement failed!");
        navigate("/customer/products");
      }
    };

    if (productId && quantity && price) {
      placeOrder();
    } else {
      alert("Missing payment details.");
      navigate("/customer/products");
    }
  }, [productId, quantity, price, navigate]);

  return <p className="text-center mt-10">Finalizing order...</p>;
};

export default PaymentSuccess;
