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