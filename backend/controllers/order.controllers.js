import { connectDB } from "../db/dbconnect.js";
import oracledb from "oracledb";

export const createOrder = async (req, res) => {
  let conn;
  try {
    const customerID = req.user.USERID;
    const {productId, quantity, price } = req.body;
    conn = await connectDB();

    const result = await conn.execute(
      `BEGIN
         PLACE_ORDER(:customerId, :productId, :quantity, :price, :orderId);
       END;`,
      {
        customerID,
        productId,
        quantity,
        price,
        orderId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await conn.commit();

    res.status(201).json({
      message: "Product added successfully",
      orderId: result.outBinds.orderId,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const transaction = async (req, res) => {
  let conn;
  try {
    const customerID = req.user.USERID;
    const {productId, quantity, price } = req.body;
    conn = await connectDB();

    const result = await conn.execute(
      `BEGIN
         PLACE_ORDER(:customerId, :productId, :quantity, :price, :orderId);
       END;`,
      {
        customerID,
        productId,
        quantity,
        price,
        orderId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await conn.commit();

    res.status(201).json({
      message: "Product added successfully",
      orderId: result.outBinds.orderId,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};
