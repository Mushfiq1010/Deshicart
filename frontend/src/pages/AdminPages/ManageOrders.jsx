import React, { useEffect, useState } from "react";
import API from "../../Api";
import { CheckCircle, XCircle } from "lucide-react";

const ManageOrders = () => {
  const [groupedOrders, setGroupedOrders] = useState({});

  const fetchOrders = async () => {
    try {
      const res = await API.get("/admin/pending-orders");
      const data = res.data;

      // Group orders by city
      const grouped = data.reduce((acc, order) => {
        const city = order.CITY || "Unknown City";
        if (!acc[city]) acc[city] = [];
        acc[city].push(order);
        return acc;
      }, {});
      setGroupedOrders(grouped);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await API.post(`/admin/${action}-order/${id}`);
      // Remove the order from groupedOrders
      setGroupedOrders((prev) => {
        const updated = { ...prev };
        for (const city in updated) {
          updated[city] = updated[city].filter((o) => o.ORDERID !== id);
          if (updated[city].length === 0) delete updated[city];
        }
        return updated;
      });
    } catch (err) {
      console.error(`${action} failed`, err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Pending Orders (Grouped by City)</h1>

      {Object.keys(groupedOrders).length === 0 ? (
        <p className="text-center text-gray-600">No pending orders.</p>
      ) : (
        Object.entries(groupedOrders).map(([city, orders]) => (
          <div key={city} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">
              📦 Warehouse: {city}
            </h2>

            <div className="overflow-x-auto shadow border rounded-lg bg-white">
              <table className="min-w-full table-auto text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-900 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.ORDERID} className="border-t">
                      <td className="px-4 py-2">{o.ORDERID}</td>
                      <td className="px-4 py-2">{o.CUSTOMERID}</td>
                      <td className="px-4 py-2">
                        {new Date(o.ORDERDATE).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">৳{o.SUBTOTAL.toFixed(2)}</td>
                      <td className="px-4 py-2">৳{o.TOTAL.toFixed(2)}</td>
                      <td className="px-4 py-2 flex justify-center space-x-3">
                        <button
                          onClick={() => updateStatus(o.ORDERID, "accept")}
                          className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 flex items-center"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(o.ORDERID, "decline")}
                          className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 flex items-center"
                        >
                          <XCircle size={16} className="mr-1" />
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageOrders;
