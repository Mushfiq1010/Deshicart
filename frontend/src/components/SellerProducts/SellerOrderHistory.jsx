import React, { useEffect, useState } from "react";
import API from "../../Api";
import Navbar from "../Navbar";

const SellerOrderHistory = ({ sellerId }) => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/orders/sales`);
        const orderData = res.data;

        if (!Array.isArray(orderData)) {
          console.error("Expected array for order data, got:", orderData);
          return;
        }

        setOrders(orderData);

        // Build analytics summary: units sold and revenue per product
        const summary = {};
        orderData.forEach(({ PRODUCTNAME, QUANTITY, TOTAL }) => {
          const name = PRODUCTNAME || "(Unnamed Product)";
          const qty = Number(QUANTITY) || 0;
          const revenue = Number(TOTAL) || 0;

          if (!summary[name]) {
            summary[name] = { units: 0, revenue: 0 };
          }

          summary[name].units += qty;
          summary[name].revenue += revenue;
        });

        const analyticsData = Object.entries(summary).map(
          ([name, { units, revenue }]) => ({
            name,
            units,
            revenue,
          })
        );

        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    fetchHistory();
  }, [sellerId]);

  return (
    <>
      <Navbar userType="seller" />
      <div className="p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">
          🧾 Seller Order History
        </h2>

        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 mb-10">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID", "Date", "Product", "Qty", "Price", "Total"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {orders.map((o, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{o.ORDERID}</td>
                  <td className="px-6 py-4">{o.ORDERDATE}</td>
                  <td className="px-6 py-4">{o.PRODUCTNAME || "Unnamed"}</td>
                  <td className="px-6 py-4">{o.QUANTITY || 0}</td>
                  <td className="px-6 py-4">
                    $
                    {typeof o.PRICE === "number"
                      ? o.PRICE.toFixed(2)
                      : "0.00"}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600">
                    $
                    {typeof o.TOTAL === "number"
                      ? o.TOTAL.toFixed(2)
                      : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          🏆 Top Selling Products
        </h3>
        <div className="bg-white p-4 rounded-xl border shadow space-y-4 max-w-md mx-auto">
          {analytics.length === 0 ? (
            <p className="text-center text-gray-500">No sales data available.</p>
          ) : (
            analytics
              .sort((a, b) => b.units - a.units)
              .slice(0, 5)
              .map(({ name, units, revenue }, idx) => (
                <div
                  key={name}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg">#{idx + 1}</span>
                    <span className="font-semibold">{name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-medium">{units} sold</p>
                    <p className="text-gray-600 text-sm">
                      ${revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </>
  );
};

export default SellerOrderHistory;
