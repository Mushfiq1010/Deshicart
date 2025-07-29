// src/context/CategoryContext.js
import React, { createContext, useState, useEffect } from "react";
import API from "../Api";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap,setCategoryMap] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories"); 
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

    fetchCategories();
    setLoading(false); 
  }, []);

  return (
    <CategoryContext.Provider value={{ categoryMap, categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};
