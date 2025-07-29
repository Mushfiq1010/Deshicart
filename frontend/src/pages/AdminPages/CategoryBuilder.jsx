import React, { useState, useEffect } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import API from "../../Api";
const CategoryBuilder = () => {
  const [categories, setCategories] = useState([]);
  const [existingCategories, setExistingCategories] = useState([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
const [parentIdForNew, setParentIdForNew] = useState(null);

      const fetchCategories = async () => {
      try {
        const res = await API.get("/admin/categories");
        setExistingCategories(res.data);
      } catch (err) {
        console.error("Error fetching existing categories:", err);
      }
    };
  useEffect(() => {

    fetchCategories();
  }, []);

  const buildTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((cat) => {
      map[cat.categoryid] = { ...cat, children: [] };
    });

    list.forEach((cat) => {
      if (cat.parentid === null) {
        roots.push(map[cat.categoryid]);
      } else if (map[cat.parentid]) {
        map[cat.parentid].children.push(map[cat.categoryid]);
      }
    });

    return roots;
  };

const renderExistingTree = (arr, level = 0) => {
  return arr.map((cat) => (
    <div
      key={cat.categoryid}
      className={`pl-${level * 4} border-l-2 border-gray-200 ml-2 py-1`}
    >
      <div className="flex items-center gap-2 text-gray-800 font-medium hover:text-indigo-600 transition-colors duration-150">
        <FaFolder className="text-yellow-500" />
        <span>{cat.name}</span>
        <button
          className="text-green-600 hover:text-green-800"
          onClick={() => setParentIdForNew(cat.categoryid)}
        >
          <FaPlus />
        </button>
      </div>

      {cat.children && cat.children.length > 0 && (
        <div className="ml-4">
          {renderExistingTree(cat.children, level + 1)}
        </div>
      )}
    </div>
  ));
};




  const addCategory = () => {
    setCategories([...categories, { name: "", subcategories: [] }]);
  };

  const updateCategoryName = (path, newName) => {
    const update = (arr, depth = 0) =>
      arr.map((cat, i) => {
        if (depth === path.length - 1 && i === path[depth]) {
          return { ...cat, name: newName };
        }
        if (i === path[depth]) {
          return {
            ...cat,
            subcategories: update(cat.subcategories || [], depth + 1),
          };
        }
        return cat;
      });

    setCategories((prev) => update(prev));
  };

  const addSubcategory = (path) => {
    const update = (arr, depth = 0) =>
      arr.map((cat, i) => {
        if (i === path[depth]) {
          if (depth === path.length - 1) {
            return {
              ...cat,
              subcategories: [...(cat.subcategories || []), { name: "", subcategories: [] }],
            };
          } else {
            return {
              ...cat,
              subcategories: update(cat.subcategories || [], depth + 1),
            };
          }
        }
        return cat;
      });

    setCategories((prev) => update(prev));
  };

  const renderNewCategories = (arr, path = []) => {
    return arr.map((cat, index) => {
      const currentPath = [...path, index];
      return (
        <div key={currentPath.join("-")} className="ml-4 mt-2 border-l pl-2">
          <input
            type="text"
            value={cat.name}
            onChange={(e) => updateCategoryName(currentPath, e.target.value)}
            placeholder="Category Name"
            className="border px-2 py-1 rounded mr-2"
          />
          <button
            onClick={() => addSubcategory(currentPath)}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Add Subcategory
          </button>
          {cat.subcategories && renderNewCategories(cat.subcategories, currentPath)}
        </div>
      );
    });
  };

  const handleSubmit = async () => {
    try {
      await API.post("/admin/addcategories", categories);
      alert("Categories submitted successfully!");
      setCategories([]);
      fetchCategories();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit categories.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Existing Categories</h2>
   <div className="mb-6 bg-white p-6 rounded shadow border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-700 mb-4">
    Category Hierarchy
  </h3>
  {renderExistingTree(buildTree(existingCategories))}
  {parentIdForNew && (
  <div className="mt-4 ml-6">
    <input
      type="text"
      placeholder="New Subcategory Name"
      value={newSubcategoryName}
      onChange={(e) => setNewSubcategoryName(e.target.value)}
      className="border px-2 py-1 rounded mr-2"
    />
    <button
      onClick={async () => {
        if (!newSubcategoryName.trim()) return alert("Name cannot be empty");
        try {
     await API.post(`/admin/categories/${parentIdForNew}/add`, {
  name: newSubcategoryName,
});
          alert("Subcategory added successfully!");
          setNewSubcategoryName("");
          setParentIdForNew(null);
          fetchCategories();
        } catch (err) {
          console.error("Add subcategory error:", err);
          alert("Failed to add subcategory");
        }
      }}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      Submit Subcategory
    </button>
    <button
      onClick={() => {
        setParentIdForNew(null);
        setNewSubcategoryName("");
      }}
      className="ml-2 text-sm text-gray-500 hover:underline"
    >
      Cancel
    </button>
  </div>
)}
</div>


      <h2 className="text-xl font-bold mb-4">Add New Categories</h2>

      <div className="mb-4">
        <button
          onClick={addCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Root Category
        </button>
      </div>

      <div>{renderNewCategories(categories)}</div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Submit Categories
        </button>
      </div>
    </div>
  );
};

export default CategoryBuilder;

