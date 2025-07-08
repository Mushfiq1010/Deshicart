import React, { useEffect, useState } from "react";
import API from "../../Api";
import Navbar from "../Navbar";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const res = await API.get("/customer/getcart");
      if (res.data.cart) setCartItems(res.data.cart);
      else if (Array.isArray(res.data)) setCartItems(res.data);
      else setError("Cart data format error.");
    } catch (err) {
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const get = (item, key) =>
    item[key] ?? item[key.toUpperCase()] ?? item[key.toLowerCase()] ?? 0;

  const getName = (item) => get(item, "name") || "Unnamed";
  const getQty = (item) => get(item, "quantity");
  const getPrice = (item) => get(item, "price");
  const getCartItemId = (item) => get(item, "cartItemID");

  const total = cartItems.reduce(
    (sum, item) => sum + getPrice(item) * getQty(item),
    0
  );

  const handleRemove = async (cartItemId) => {
    try {
      await API.post("/customer/removecart", { cartItemId });
      fetchCartItems();
    } catch {
      alert("Failed to remove item from cart");
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return; 
    try {
        
      await API.post("/customer/updatecartquantity", { cartItemId, quantity: newQty });
      fetchCartItems();
    } catch {
      alert("Failed to update quantity");
    }
  };


  const handleCheckout = async () => {
  try {
    const res = await API.post("/customer/placeorder");
    alert("✅ " + res.data.message);
    fetchCartItems(); 
  } catch (err) {
    console.error("Checkout error:", err);
    alert("❌ Failed to place order.");
  }
};


  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && cartItems.length === 0 && (
          <p className="text-gray-600">Your cart is empty.</p>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <>
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const cartItemId = getCartItemId(item);
                const qty = getQty(item);

                return (
                  <div
                    key={cartItemId || index}
                    className="flex justify-between border-b pb-2 items-center"
                  >
                    <div>
                      <p className="font-semibold">{getName(item)}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <button
                          className="px-2 bg-gray-300 rounded"
                          onClick={() => updateQuantity(cartItemId, qty - 1)}
                          disabled={qty <= 1}
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span>Quantity: {qty}</span>
                        <button
                          className="px-2 bg-gray-300 rounded"
                          onClick={() => updateQuantity(cartItemId, qty + 1)}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p>${(getPrice(item) * qty).toFixed(2)}</p>
                      <button
                        onClick={() => handleRemove(cartItemId)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-right font-bold text-lg mt-6">
              Total: ${total.toFixed(2)}
            </div>
            <div className="text-right mt-4">
  <button
    onClick={handleCheckout}
    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
  >
    Checkout
  </button>
</div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;



