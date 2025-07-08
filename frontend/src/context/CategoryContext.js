// src/context/CategoryContext.js
import React, { createContext, useState, useEffect } from "react";
import API from "../Api";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap,setCategoryMap] = useState({});
  // Check login status from localStorage (or however you store it)
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories"); // your actual API path
        setCategories(res.data);
        const map = {};
        res.data.forEach((cat) => {
          map[cat.categoryid] = cat;
        });
        setCategoryMap(map);

      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) fetchCategories();
    else setLoading(false); // avoid stuck loading state
  }, [isLoggedIn]);

  return (
    <CategoryContext.Provider value={{ categoryMap, categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};
