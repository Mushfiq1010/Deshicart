import React, { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa"; // Import the history icon
import Navbar from "../components/Navbar";
import API from "../Api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get(`/orders`);
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <>
      <Navbar userType="customer" />
      <div className="min-h-screen bg-gradient-to-r from-pink-100 via-yellow-100 to-teal-100">
        <div className="max-w-6xl mx-auto p-4 mt-6">
          <div className="flex items-center mb-6">
            <FaHistory className="text-4xl text-gray-700 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">My Orders</h2>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500">You have no orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.ORDERID}
                className="border border-gray-200 rounded-lg p-6 mb-6 shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-indigo-50 to-teal-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Order ID:</span>{" "}
                      {order.ORDERID}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(order.ORDERDATE).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`font-medium px-2 py-0.5 rounded ${
                          order.STATUS === "P"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.STATUS === "F"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.STATUS === "P"
                          ? "On delivery"
                          : order.STATUS === "F"
                          ? "Failed"
                          : "Delivered"}
                      </span>
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Subtotal:</span> ৳
                      {order.SUBTOTAL}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Total:</span> ৳{order.TOTAL}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleDetails(order.ORDERID)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {expandedOrderId === order.ORDERID
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>

                {/* Item details toggle */}
                {expandedOrderId === order.ORDERID && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">
                      Order Items
                    </h4>
                    {order.items.map((item) => (
                      <div
                        key={item.ORDERITEMID}
                        className="flex justify-between items-center bg-gray-50 p-4 rounded mb-2 border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.PRODUCTNAME}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.QUANTITY}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Price: ৳{item.PRICE}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ৳{item.TOTAL}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;


