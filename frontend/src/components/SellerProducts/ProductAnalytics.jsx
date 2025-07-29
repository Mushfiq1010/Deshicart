import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import API from "../../Api";
import { useParams } from "react-router-dom";

const ProductAnalytics = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get(`/products/analytics/${id}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };
    fetchAnalytics();
  }, [id]);

  const best = analytics.reduce(
    (acc, cur) => (cur.UNITS_SOLD > acc.UNITS_SOLD ? cur : acc),
    { UNITS_SOLD: 0 }
  );

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        📊 Product Sales & Price Trends
      </h2>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="SALE_DATE"
              tick={{ fontSize: 12 }}
              label={{ value: "Date", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{
                value: "Units Sold",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{
                value: "Price",
                angle: -90,
                position: "insideRight",
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="UNITS_SOLD"
              stroke="#16a34a"
              strokeWidth={2}
              name="Units Sold"
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="PRICE_AT_THAT_TIME"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Price"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {best.UNITS_SOLD > 0 && (
        <div className="mt-6 text-center text-gray-700 text-base">
          🏆 <span className="font-medium">Best Sales Day:</span>{" "}
          <span className="text-indigo-600 font-semibold">
            {best.SALE_DATE}
          </span>{" "}
          with{" "}
          <span className="text-green-600 font-semibold">
            {best.UNITS_SOLD}
          </span>{" "}
          units sold at price{" "}
          <span className="text-blue-600 font-semibold">
            ৳{best.PRICE_AT_THAT_TIME}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductAnalytics;
