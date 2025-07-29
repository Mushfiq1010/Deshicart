import { connectDB } from "../db/dbconnect.js";
import oracledb from "oracledb";

export const transaction = async (req, res) => {
  let conn;
  try {
    const customerID = req.user.USERID;
    const { productId, quantity, price } = req.body;
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

export const getAllOrders = async (req, res) => {
  let connection;

  try {
    connection = await connectDB();
    const customerId = req.user.USERID;
    const ordersResult = await connection.execute(
      `
      SELECT 
        ORDERID, ORDERDATE, STATUS, SUBTOTAL, TOTAL
      FROM PRODUCTORDER
      WHERE CUSTOMERID = :customerId
      ORDER BY ORDERDATE DESC
      `,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const orders = ordersResult.rows;

    // For each order, fetch the items
    for (let order of orders) {
      const orderItemsResult = await connection.execute(
        `
        SELECT 
          oi.ORDERITEMID,
          oi.PRODUCTID,
          p.NAME AS PRODUCTNAME,
          oi.QUANTITY,
          oi.PRICE,
          oi.TOTAL
        FROM ORDERITEM oi
        JOIN PRODUCT p ON oi.PRODUCTID = p.PRODUCTID
        WHERE oi.ORDERID = :orderId
        `,
        [order.ORDERID],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      order.items = orderItemsResult.rows;
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Failed to fetch customer orders" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection:", err);
      }
    }
  }
};
