import { connectDB } from "../db/dbconnect.js";
import oracledb from "oracledb";


export const getAllProducts = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT p.PRODUCTID, p.NAME, p.DESCRIPTION, p.PRICE, p.QUANTITY, 
              p.CATEGORYID, p.SELLERID, s.STORENAME, i.IMAGEURL
       FROM PRODUCT p
       JOIN SELLER s ON p.SELLERID = s.SELLERID
       LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
         AND pi.IMAGEID = (
           SELECT MIN(IMAGEID) FROM PRODUCTIMAGE WHERE PRODUCTID = p.PRODUCTID
         )
       LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

const products = result.rows.map(row => ({
  PRODUCTID: row.PRODUCTID,
  NAME: row.NAME,
  PRICE: row.PRICE,
  QUANTITY: row.QUANTITY,
  IMAGEURL: row.IMAGEURL,
  SELLERID: row.SELLERID
}));


    res.json(products);
  } catch (err) {
    console.error("Admin getAllProducts error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) await conn.close();
  }
};


export const adminDeleteProduct = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await connectDB();

    const imageResult = await conn.execute(
      `SELECT i.IMAGEID 
       FROM PRODUCTIMAGE pi
       JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID
       WHERE pi.PRODUCTID = :id`,
      [Number(id)],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conn.execute(
      `DELETE FROM PRODUCTIMAGE WHERE PRODUCTID = :id`,
      [Number(id)],
      { autoCommit: true }
    );

    for (const row of imageResult.rows) {
      const imageId = row.IMAGEID;

      const imageCountResult = await conn.execute(
        `SELECT COUNT(*) AS COUNT FROM PRODUCTIMAGE WHERE IMAGEID = :imageId`,
        [imageId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const imageCount = imageCountResult.rows[0].COUNT;

      if (imageCount === 0) {
        await conn.execute(
          `DELETE FROM IMAGE WHERE IMAGEID = :imageId`,
          [imageId],
          { autoCommit: true }
        );
      }
    }

    const result = await conn.execute(
      `DELETE FROM Product WHERE ProductID = :id`,
      { id: Number(id) },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Product not found");
    }

    res.send("Product deleted successfully by admin");
  } catch (err) {
    console.error("Admin delete error:", err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};

export const getSellers = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT u.USERID, u.NAME, u.EMAIL, u.PHONE, s.STORENAME, s.STOREDESCRIPTION
       FROM SERVICEUSER u
       JOIN SELLER s ON u.USERID = s.SELLERID
       ORDER BY u.USERID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in getSellers:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const getCustomers = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT u.USERID, u.NAME, u.EMAIL, u.PHONE
       FROM SERVICEUSER u
       JOIN CUSTOMER c ON u.USERID = c.CUSTOMERID
       ORDER BY u.USERID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in getCustomers:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const deleteSeller = async (req, res) => {
  let conn;
  try {
    const { sellerId } = req.params;
    conn = await connectDB();

    // Step 1: Get all product IDs of this seller
    const productResult = await conn.execute(
      `SELECT PRODUCTID FROM PRODUCT WHERE SELLERID = :sellerId`,
      [sellerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const productIds = productResult.rows.map(row => row.PRODUCTID);

    // Step 2: Delete images associated with those products
    for (const productId of productIds) {
      // Get image IDs
      const imageResult = await conn.execute(
        `SELECT IMAGEID FROM PRODUCTIMAGE WHERE PRODUCTID = :productId`,
        [productId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const imageIds = imageResult.rows.map(row => row.IMAGEID);

      // Delete from PRODUCTIMAGE
      await conn.execute(
        `DELETE FROM PRODUCTIMAGE WHERE PRODUCTID = :productId`,
        [productId],
        { autoCommit: false }
      );

      // Delete orphan images
      for (const imageId of imageIds) {
        const countResult = await conn.execute(
          `SELECT COUNT(*) AS COUNT FROM PRODUCTIMAGE WHERE IMAGEID = :imageId`,
          [imageId],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (countResult.rows[0].COUNT === 0) {
          await conn.execute(
            `DELETE FROM IMAGE WHERE IMAGEID = :imageId`,
            [imageId],
            { autoCommit: false }
          );
        }
      }
    }

    // Step 3: Delete products
    await conn.execute(
      `DELETE FROM PRODUCT WHERE SELLERID = :sellerId`,
      [sellerId],
      { autoCommit: false }
    );

    // Step 4: Delete from SELLER
    await conn.execute(
      `DELETE FROM SELLER WHERE SELLERID = :sellerId`,
      [sellerId],
      { autoCommit: false }
    );

    // Step 5: Delete from SERVICEUSER
    const result = await conn.execute(
      `DELETE FROM SERVICEUSER WHERE USERID = :sellerId`,
      [sellerId],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }

    res.json({ message: "Seller and all associated products deleted successfully." });
  } catch (err) {
    console.error("Error deleting seller:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) await conn.close();
  }
};



export const getTopOrderedProducts = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT p.PRODUCTID, p.NAME, p.PRICE, p.QUANTITY, p.SELLERID,
              SUM(od.QUANTITY) AS TOTAL_ORDERS,
              i.IMAGEURL
       FROM PRODUCT p
       JOIN ORDERITEM od ON p.PRODUCTID = od.PRODUCTID
       LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
         AND pi.IMAGEID = (
           SELECT MIN(IMAGEID)
           FROM PRODUCTIMAGE
           WHERE PRODUCTID = p.PRODUCTID
         )
       LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID
       GROUP BY p.PRODUCTID, p.NAME, p.PRICE, p.QUANTITY, p.SELLERID, i.IMAGEURL
       ORDER BY TOTAL_ORDERS DESC
       FETCH FIRST 10 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in getTopOrderedProducts:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) await conn.close();
  }
};


export const getOrderHistory = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();

    const query = `
      SELECT o.ORDERID, o.ORDERDATE, o.TOTAL, c.CUSTOMERID,
             p.NAME AS PRODUCT_NAME, od.QUANTITY, od.PRICE AS ITEM_PRICE, od.TOTAL AS ITEM_TOTAL
      FROM ORDERITEM od
      JOIN PRODUCT p ON od.PRODUCTID = p.PRODUCTID
      JOIN PRODUCTORDER o ON od.ORDERID = o.ORDERID
      JOIN CUSTOMER c ON o.CUSTOMERID = c.CUSTOMERID
      ORDER BY o.ORDERDATE DESC, o.ORDERID, p.NAME
    `;

    const result = await conn.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const ordersMap = new Map();
    let totalTransactionAmount = 0;
      let totalTransactionAmountToday = 0;
    for (const row of result.rows) {
      const {
        ORDERID,
        ORDERDATE,
        TOTAL,  
        CUSTOMERID,
        PRODUCT_NAME,
        QUANTITY,
        ITEM_PRICE,
        ITEM_TOTAL,
      } = row;

       const orderDateStr = new Date(ORDERDATE).toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      if (!ordersMap.has(ORDERID)) {
        ordersMap.set(ORDERID, {
          orderId: ORDERID,
          orderDate: ORDERDATE,
          customerId: CUSTOMERID,
          items: [],
          totalTransactionAmount: Number(TOTAL), 
          totalOrderAmount: Number(TOTAL), 
        });
        if(orderDateStr===todayStr) totalTransactionAmountToday+=TOTAL;
        totalTransactionAmount += TOTAL;
      }

      const order = ordersMap.get(ORDERID);

      
      order.items.push({
        productName: PRODUCT_NAME,
        quantity: QUANTITY,
        price: Number(ITEM_PRICE),
        itemTotal: Number(ITEM_TOTAL),
      });
       
    }

    
    const orderHistory = Array.from(ordersMap.values());
  
   
    res.json({ totalTransactionAmount,totalTransactionAmountToday, orderHistory });
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ error: "Database error while fetching order history" });
  } finally {
    if (conn) await conn.close();
  }
};


export const getTopSellers = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();

    const query = `
      SELECT s.SELLERID, s.STORENAME, SUM(od.QUANTITY) AS TOTAL_SOLD
      FROM ORDERITEM od
      JOIN PRODUCT p ON od.PRODUCTID = p.PRODUCTID
      JOIN SELLER s ON p.SELLERID = s.SELLERID
      GROUP BY s.SELLERID, s.STORENAME
      ORDER BY TOTAL_SOLD DESC
      FETCH FIRST 3 ROWS ONLY
    `;

    const result = await conn.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching top sellers:", err);
    res.status(500).json({ error: "Database error while fetching top sellers" });
  } finally {
    if (conn) await conn.close();
  }
};






