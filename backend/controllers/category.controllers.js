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

export const getRootCategories = async (req, res) => {
  let connection;

  try {
    connection = await connectDB();
    const result = await connection.execute(
      `SELECT CategoryID, Name, ParentID FROM Category
   WHERE ParentID IS NULL
   ORDER BY Name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // ✅ Add this
    );

    const categories = result.rows.map((row) => ({
      categoryid: row.CATEGORYID, // ✅ Now you can use property names
      name: row.NAME,
      parentid: row.PARENTID,
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

    const insertCategory = async (category, parentId = null, rootId = null) => {
      console.log(
        `Inserting category: ${category.name}, ParentID: ${parentId}, RootID: ${rootId}`
      );

      const result = await connection.execute(
        `INSERT INTO Category (Name, ParentID, RootCategoryID)
         VALUES (:name, :parentid, :rootid)
         RETURNING CategoryID INTO :id`,
        {
          name: category.name,
          parentid: parentId,
          rootid: rootId,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false }
      );

      const newId = result.outBinds.id; // Use .id directly
      const newRootId = rootId || newId;

      for (const sub of category.subcategories || []) {
        await insertCategory(sub, newId, newRootId);
      }
    };

    for (const cat of categories) {
      await insertCategory(cat);
    }

    await connection.commit();
    res.status(201).json({ message: "All categories inserted successfully" });
  } catch (err) {
    console.error("Error submitting categories:", err.stack || err);
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

  let connection;

  try {
    connection = await connectDB();

    const result = await connection.execute(
      `SELECT CategoryID, RootCategoryID FROM Category WHERE CategoryID = :parentid`,
      { parentid: parseInt(parentid) }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Parent category not found" });
    }

    const [categoryId, rootCategoryIdRaw] = result.rows[0];
    const rootCategoryId =
      rootCategoryIdRaw !== null ? rootCategoryIdRaw : categoryId;

    console.log(
      `Adding subcategory: ${name}, under ParentID: ${parentid}, RootID: ${rootCategoryId}`
    );

    await connection.execute(
      `INSERT INTO Category (Name, ParentID, RootCategoryID)
       VALUES (:name, :parentid, :rootid)`,
      {
        name,
        parentid: parseInt(parentid),
        rootid: rootCategoryId,
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Subcategory added successfully" });
  } catch (err) {
    console.error("Error adding subcategory:", err.stack || err);
    res.status(500).json({ error: "Failed to add subcategory" });
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
