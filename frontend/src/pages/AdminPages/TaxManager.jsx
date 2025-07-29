import React, { useEffect, useState } from "react";
import API from "../../Api";

const TaxManager = () => {
  const [categories, setCategories] = useState([]);
  const [vatData, setVatData] = useState({});
  const [vatHistory, setVatHistory] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCats = await API.get("/categories/roots");
        const rootCats = resCats.data;
        setCategories(rootCats);

        const vatAllPromises = rootCats.map((cat) =>
          API.get(`/admin/vat/${cat.categoryid}`)
            .then((res) => ({ categoryid: cat.categoryid, vats: res.data }))
            .catch(() => ({ categoryid: cat.categoryid, vats: [] }))
        );

        const vatAllResults = await Promise.all(vatAllPromises);

        const historyMap = {};
        const formData = {};
        const expandMap = {};

        vatAllResults.forEach(({ categoryid, vats }) => {
          historyMap[categoryid] = vats;
          const recent = vats[0] || {};
          formData[categoryid] = {
            rate: recent.rate || "",
            effectiveFrom: recent.effectiveFrom || "",
            effectiveTo: recent.effectiveTo || "",
          };
          expandMap[categoryid] = false;
        });

        setVatData(formData);
        setVatHistory(historyMap);
        setExpanded(expandMap);
      } catch (err) {
        console.error("Failed to fetch VAT data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (catId, field, value) => {
    setVatData((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [field]: value,
      },
    }));
  };

  const toggleExpand = (catId) => {
    setExpanded((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleSubmit = async (catId) => {
    try {
      setSaving(true);
      const { rate, effectiveFrom, effectiveTo } = vatData[catId];

      if (!rate || !effectiveFrom) {
        alert("Rate and Effective From date are required");
        return;
      }

      const payload = {
        categoryId: catId,
        rate: parseFloat(rate),
        effectiveFrom,
        ...(effectiveTo && { effectiveTo }),
      };

      await API.post("/admin/vat", payload);
      alert("✅ VAT updated successfully.");

      const res = await API.get(`/admin/vat/${catId}`);
      setVatHistory((prev) => ({
        ...prev,
        [catId]: res.data,
      }));
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save VAT.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading VAT data...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        VAT Management
      </h1>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.categoryid}
            className="border rounded-md shadow-md bg-white"
          >
            <button
              onClick={() => toggleExpand(cat.categoryid)}
              className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 transition font-semibold text-blue-700 flex justify-between items-center"
            >
              {cat.name}
              <span className="text-sm text-gray-500">
                {expanded[cat.categoryid] ? "▲" : "▼"}
              </span>
            </button>

            {expanded[cat.categoryid] && (
              <div className="p-4 border-t space-y-6">
                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">VAT Rate (%)</label>
                    <input
                      type="number"
                      value={vatData[cat.categoryid]?.rate || ""}
                      onChange={(e) =>
                        handleChange(cat.categoryid, "rate", e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Effective From
                    </label>
                    <input
                      type="date"
                      value={vatData[cat.categoryid]?.effectiveFrom || ""}
                      onChange={(e) =>
                        handleChange(
                          cat.categoryid,
                          "effectiveFrom",
                          e.target.value
                        )
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Effective To (optional)
                    </label>
                    <input
                      type="date"
                      value={vatData[cat.categoryid]?.effectiveTo || ""}
                      onChange={(e) =>
                        handleChange(
                          cat.categoryid,
                          "effectiveTo",
                          e.target.value
                        )
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => handleSubmit(cat.categoryid)}
                      disabled={saving}
                      className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
                        saving ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                {/* History */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    VAT History
                  </h4>
                  {vatHistory[cat.categoryid]?.length > 0 ? (
                    <table className="w-full text-sm text-left border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 border">Rate</th>
                          <th className="p-2 border">Effective From</th>
                          <th className="p-2 border">Effective To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vatHistory[cat.categoryid].map((vat) => (
                          <tr key={vat.taxId}>
                            <td className="p-2 border">{vat.rate}%</td>
                            <td className="p-2 border">{vat.effectiveFrom}</td>
                            <td className="p-2 border">
                              {vat.effectiveTo || "Ongoing"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No VAT records found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxManager;
