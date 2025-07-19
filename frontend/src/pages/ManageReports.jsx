import { useEffect, useState } from "react";
import API from "../Api";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
  const [totalTransactionForDay, setTotalTransactionForDay] = useState(0); 

  useEffect(() => {
    
    API.get("/admin/orders/history")
      .then((res) => {
        const { totalTransactionAmount,totalTransactionAmountToday, orderHistory } = res.data;
        setOrders(orderHistory);
        setTotalTransactionAmount(totalTransactionAmount);
        setTotalTransactionForDay(totalTransactionAmountToday);
      })
      .catch((err) => {
        console.error("Error fetching order history:", err);
      });

    

  }, []);

  return (
    <div className="p-6 flex flex-col items-center bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🛒 Order History</h2>
      {orders.length === 0 && <p className="text-lg text-gray-500">No orders found.</p>}

    
      <div className="mb-6 text-xl font-semibold text-indigo-600">
        <p>Total Transaction Amount Till Date: ৳ {totalTransactionAmount}</p>
      </div>

     
      <div className="mb-6 text-xl font-semibold text-green-600">
        <p>Total Transaction for Today: ৳ {totalTransactionForDay}</p>
      </div>

      
      {orders.map((order) => (
        <div
          key={order.orderId}
          className="bg-white w-full md:w-[450px] lg:w-[600px] border border-gray-300 rounded-xl shadow-lg mb-8 p-6 font-sans transition-transform duration-300 transform hover:scale-105"
        >
          <div className="text-center mb-4">
            <p className="text-xl font-semibold text-indigo-600">Order ID: #{order.orderId}</p>
            <p className="text-sm text-gray-600">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Customer ID: {order.customerId}</p>
          </div>

          <hr className="my-3" />

          <div className="grid grid-cols-3 text-sm font-semibold border-b pb-2 mb-3">
            <span className="text-gray-700">Item</span>
            <span className="text-center text-gray-700">Quantity</span>
            <span className="text-right text-gray-700">Price</span>
          </div>

        
          {order.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 text-sm py-2 border-b last:border-none">
              <span className="text-gray-700">{item.productName}</span>
              <span className="text-center text-gray-700">{item.quantity}</span>
              <span className="text-right text-indigo-600">৳ {item.itemTotal}</span>
            </div>
          ))}

          <hr className="my-3" />

          
          <div className="flex justify-between font-semibold text-lg text-gray-800">
            <p>Total Transaction:</p>
            <p>৳ {order.totalTransactionAmount}</p>
          </div>
          
          <div className="flex justify-between font-semibold text-sm text-gray-600">
            <p>Total Order Amount:</p>
            <p>৳ {order.totalOrderAmount}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;







