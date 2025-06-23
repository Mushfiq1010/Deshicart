import jwt from "jsonwebtoken";
import oracledb from "oracledb";
import { connectDB } from "../db/dbconnect.js";

export const protectRoute = async (req, res, next) => {
  let conn;

  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    conn = await connectDB();

    const result = await conn.execute(
      `SELECT UserID, Name, Email, Phone, DateOfBirth, Gender, ProfileImage, CreatedAt
       FROM SERVICEUSER
       WHERE UserID = :userId`,
      [decoded.userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach user data to the request
    next();
  } catch (error) {
    console.error("Error in protectRoute:", error.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};
