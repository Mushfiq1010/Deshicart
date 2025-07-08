import { connectDB } from "../db/dbconnect.js";
import oracledb from "oracledb";

export const createOrder = async (req, res) => {
    let conn;
    try {
        const customerId = req.user.USERID;
        const { productId, quantity, price } = req.body;
        const status = 'y';
        conn = await connectDB();
         const orderResult = await conn.execute(
              `INSERT INTO PRODUCTORDER (CUSTOMERID, SUBTOTAL, STATUS, TOTAL)
               VALUES (:customerId, :price, :status, :price)
               RETURNING ORDERID INTO :orderId`,
              {
                customerId,
                price,
                status,
                price,
                orderId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              }
            );
    
    const orderId = orderResult.outBinds.orderId[0];

    await conn.execute(
          `INSERT INTO ORDERITEM (ORDERID,PRODUCTID, QUANTITY, PRICE, TOTAL) VALUES (:orderId, :productId, :quantity, :price,:price)`,
          {
            orderId,
            productId,
            quantity,
            price,
            price
          }
        );
        await conn.commit();
    res.status(201).json({ message: "Product added successfully" });
    } catch (err) {
    console.error("Error adding order:", err);
    res.status(500).json({ error: "Internal server error" });
    } finally {
      if (conn) await conn.close();
    }
};