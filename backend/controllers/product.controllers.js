import oracledb from "oracledb";
import { connectDB } from "../db/dbconnect.js";
import cloudinary from '../lib/utils/cloudinary.js'; 

export const getProducts = async (req, res) => {
  let conn;
  try {
    conn = await connectDB();
const result = await conn.execute(
  `SELECT p.PRODUCTID, p.NAME, p.DESCRIPTION, p.PRICE, p.QUANTITY, p.CATEGORYID, p.SELLERID,
          i.IMAGEURL
   FROM PRODUCT p
   LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
     AND pi.IMAGEID = (
          SELECT MIN(IMAGEID)
          FROM PRODUCTIMAGE
          WHERE PRODUCTID = p.PRODUCTID
     )
   LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID`,
  [],
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);


    const products = result.rows.map(row => ({
      productId: row.PRODUCTID,
      name: row.NAME,
      description: row.DESCRIPTION,
      price: row.PRICE,
      quantity: row.QUANTITY,
      categoryId: row.CATEGORYID,
      sellerId: row.SELLERID,
      firstImageUrl: row.IMAGEURL
    }));

    res.json(products);
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};



export const getSellerProducts = async (req, res) => {
  let conn;
  try {
    const sellerId = req.user.USERID;
   console.log(req.user);
   
    conn = await connectDB();
const result = await conn.execute(
  `SELECT p.PRODUCTID, p.NAME, p.DESCRIPTION, p.PRICE, p.QUANTITY, p.CATEGORYID, p.SELLERID,
          i.IMAGEURL
   FROM PRODUCT p
   LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
     AND pi.IMAGEID = (
          SELECT MIN(IMAGEID)
          FROM PRODUCTIMAGE
          WHERE PRODUCTID = p.PRODUCTID
     )
   LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID
   WHERE p.SELLERID = :sellerId`,
  [sellerId],
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);

    const products = result.rows.map(row => ({
      productId: row.PRODUCTID,
      name: row.NAME,
      description: row.DESCRIPTION,
      price: row.PRICE,
      quantity: row.QUANTITY,
      categoryId: row.CATEGORYID,
      sellerId: row.SELLERID,
      firstImageUrl: row.IMAGEURL
    }));

    res.json(products);
  } catch (err) {
    console.error("Error in getSellerProducts:", err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};


export const getProduct = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT * FROM Product WHERE ProductID = :id`,
      [Number(id)],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};

export const createProduct = async (req, res) => {
  let conn;
  try {
    const sellerId = req.user.USERID;
    const { name, description, price, quantity, categoryid } = req.body;

    conn = await connectDB();

    const productResult = await conn.execute(
      `INSERT INTO PRODUCT (SELLERID, NAME, DESCRIPTION, PRICE, QUANTITY, CATEGORYID)
       VALUES (:sellerId, :name, :description, :price, :quantity, :categoryid)
       RETURNING PRODUCTID INTO :productId`,
      {
        sellerId,
        name,
        description,
        price,
        quantity,
        categoryid,
        productId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    const productId = productResult.outBinds.productId[0];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const cloudRes = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) {
                return reject(error); 
              }
              resolve(result); 
            }
          );

          cloudRes.end(file.buffer); 
        });

        const imageRes = await conn.execute(
          `INSERT INTO IMAGE (IMAGEURL) VALUES (:url) RETURNING IMAGEID INTO :imageId`,
          {
            url: uploadResult.secure_url,
            imageId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          }
        );

        const imageId = imageRes.outBinds.imageId[0];

        await conn.execute(
          `INSERT INTO PRODUCTIMAGE (PRODUCTID, IMAGEID) VALUES (:productId, :imageId)`,
          {
            productId,
            imageId,
          }
        );
      }
    }

    await conn.commit();
    res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};


export const deleteProduct = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const sellerId = req.user.USERID;

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
      `DELETE FROM Product WHERE ProductID = :id AND SellerID = :sellerId`,
      {
        id: Number(id),
        sellerId
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(403).send("Product not found or unauthorized");
    }

    res.send("Product and associated images deleted successfully");
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};



export const updateProduct = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { name, description, price, quantity, categoryid } = req.body;
    const sellerId = req.user.USERID;

    conn = await connectDB();

    const result = await conn.execute(
      `UPDATE Product
       SET Name = :name,
           Description = :description,
           Price = :price,
           Quantity = :quantity,
           CategoryID = :categoryid
       WHERE ProductID = :id AND SellerID = :sellerId`,
      {
        name,
        description,
        price,
        quantity,
        categoryid,
        id: Number(id),
        sellerId
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(403).send("Product not found or unauthorized");
    }

    res.send("Product updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};
