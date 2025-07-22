import oracledb from "oracledb";
import { connectDB } from "../db/dbconnect.js";

export const getCategories = async (req, res) => {
    let connection;

  try {
    connection = await connectDB();
    const result = await connection.execute(
      `SELECT CategoryID, Name, ParentID FROM Category ORDER BY Name`
    );

    const categories = result.rows.map((row) => ({
      categoryid: row[0],
      name: row[1],
      parentid: row[2],
    }));

    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  } finally {
    if (connection) {
      try {
        
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

export const submitCategories = async (req, res) => {
  let connection;

  const categories = req.body;

  try {
    connection = await connectDB();

    const insertCategory = async (category, parentId = null) => {
      

      const result = await connection.execute(
        `INSERT INTO Category (Name, ParentID) VALUES (:name, :parentid) RETURNING CategoryID INTO :id`,
        {
          name: category.name,
          parentid: parentId,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false }
      );

      const newCategoryId = result.outBinds.id[0];

      // Recursively insert subcategories
      for (const sub of category.subcategories || []) {
        await insertCategory(sub, newCategoryId);
      }
    };
   console.log("Starting category submission...");
    for (const cat of categories) {
      await insertCategory(cat);
    }

    await connection.commit();

    res.status(201).json({ message: "All categories inserted successfully" });
  } catch (err) {
    console.error("Error submitting categories:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Failed to submit categories" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};


export const addSingleCategory = async (req, res) => {
  const { parentid } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const connection = await connectDB();

    await connection.execute(
      `INSERT INTO Category (name, parentid) VALUES (:name, :parentid)`,
      [name, parentid]
    );

    await connection.commit();
    res.status(201).json({ message: "Subcategory added successfully" });
  } catch (err) {
    console.error("Error adding subcategory:", err);
    res.status(500).json({ error: "Failed to add subcategory" });
  }
};


