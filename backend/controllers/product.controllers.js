import oracledb from "oracledb";
import { connectDB } from "../db/dbconnect.js";
import cloudinary from "../lib/utils/cloudinary.js";

export const getProducts = async (req, res) => {
  let conn;
  try {
    const {
      name,
      minPrice,
      maxPrice,
      category,
      page = 1,
      limit = 12,
    } = req.query;
    conn = await connectDB();

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM PRODUCT p
      LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
        AND pi.IMAGEID = (
          SELECT MIN(IMAGEID)
          FROM PRODUCTIMAGE
          WHERE PRODUCTID = p.PRODUCTID
        )
      LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID
      WHERE 1 = 1
    `;

    const params = {};

    if (name && name.trim()) {
      params.name = `%${name.toLowerCase().trim()}%`;
      baseQuery += ` AND LOWER(p.NAME) LIKE :name`;
    }

    if (minPrice) {
      baseQuery += ` AND p.PRICE >= :minPrice`;
      params.minPrice = Number(minPrice);
    }

    if (maxPrice) {
      baseQuery += ` AND p.PRICE <= :maxPrice`;
      params.maxPrice = Number(maxPrice);
    }

    if (category) {
      const categoryResult = await conn.execute(
        `SELECT CATEGORYID FROM CATEGORY
     START WITH CATEGORYID = :category
     CONNECT BY PRIOR CATEGORYID = PARENTID`,
        { category: Number(category) },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const categoryIds = categoryResult.rows.map((row) => row.CATEGORYID);
      if (categoryIds.length > 0) {
        const placeholders = categoryIds
          .map((_, idx) => `:cat${idx}`)
          .join(", ");
        baseQuery += ` AND p.CATEGORYID IN (${placeholders})`;
        categoryIds.forEach((id, idx) => {
          params[`cat${idx}`] = id;
        });
      }
    }

    let order = "";
    if (name) order += ` ORDER BY MATCH_SCORE DESC, p.AVERAGERATING DESC NULLS LAST, p.NAME ASC`;
    else order += ` ORDER BY p.AVERAGERATING DESC NULLS LAST, p.NAME ASC`;

    const countResult = await conn.execute(
      `SELECT COUNT(*) AS TOTAL ${baseQuery}`,
      params,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const totalCount = countResult.rows[0].TOTAL;
    const totalPages = Math.ceil(totalCount / limitNum);

    if (name) {
      baseQuery =
        ` ,CASE
         WHEN :name IS NULL THEN 0
         ELSE
           LENGTH(:name)/ LENGTH(p.NAME)
        END AS MATCH_SCORE
        ` + baseQuery;
    }
    const paginatedQuery = `
      SELECT p.PRODUCTID, p.NAME, p.DESCRIPTION, p.PRICE, p.QUANTITY, 
       p.CATEGORYID, p.SELLERID, i.IMAGEURL, p.AVERAGERATING
      ${baseQuery}
      ${order}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const productParams = {
      ...params,
      offset,
      limit: limitNum,
    };

    const result = await conn.execute(paginatedQuery, productParams, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const products = result.rows.map((row) => ({
      productId: row.PRODUCTID,
      name: row.NAME,
      description: row.DESCRIPTION,
      price: row.PRICE,
      quantity: row.QUANTITY,
      categoryId: row.CATEGORYID,
      sellerId: row.SELLERID,
      firstImageUrl: row.IMAGEURL,
      averageRating: row.AVERAGERATING
    }));

    res.json({
      products,
      totalPages,
      currentPage: pageNum,
      totalCount,
    });
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ error: "Database error" });
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

    const products = result.rows.map((row) => ({
      productId: row.PRODUCTID,
      name: row.NAME,
      description: row.DESCRIPTION,
      price: row.PRICE,
      quantity: row.QUANTITY,
      categoryId: row.CATEGORYID,
      sellerId: row.SELLERID,
      firstImageUrl: row.IMAGEURL,
      averageRating: row.AVERAGERATING,
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
      `SELECT p.PRODUCTID, p.NAME, p.DESCRIPTION, p.PRICE, p.QUANTITY, p.CATEGORYID, p.SELLERID, c.ROOTCATEGORYID,
          p.AVERAGERATING, i.IMAGEURL, s.STORENAME, s.STOREDESCRIPTION
      FROM PRODUCT p
      LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
      AND pi.IMAGEID = (
          SELECT MIN(IMAGEID)
          FROM PRODUCTIMAGE
          WHERE PRODUCTID = p.PRODUCTID
      )
      LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID
      LEFT JOIN CATEGORY c ON p.CATEGORYID = c.CATEGORYID
      JOIN SELLER s ON s.SELLERID = p.SELLERID 
      WHERE p.PRODUCTID = :productId`,
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

    await conn.execute(
      `DELETE FROM ORDERITEM WHERE PRODUCTID = :id`,
      [Number(id)],
      { autoCommit: true }
    );

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
        sellerId,
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
        sellerId,
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

export const getProductAnalytics = async (req, res) => {
  const productId = req.params.id;

  if (isNaN(productId)) {
    console.error("Invalid productId passed:", req.params.productId);
    return res.status(400).json({ error: "Invalid product ID" });
  }

  let connection;

  try {
    connection = await connectDB();

    const result = await connection.execute(
      `
      WITH price_history_ranked AS (
  SELECT 
    pph.ProductID,
    pph.Price,
    pph.ChangedOn,
    po.OrderID,
    po.OrderDate,
    oi.Quantity,
    ROW_NUMBER() OVER (
      PARTITION BY po.OrderID, oi.ProductID
      ORDER BY 
        CASE WHEN pph.ChangedOn <= po.OrderDate THEN 0 ELSE 1 END,
        pph.ChangedOn DESC NULLS LAST
    ) AS rn
  FROM ProductOrder po
  JOIN OrderItem oi ON po.OrderID = oi.OrderID
  LEFT JOIN ProductPriceHistory pph ON pph.ProductID = oi.ProductID
  WHERE oi.ProductID = :productId
    AND po.Status = 'Y'
)
SELECT 
  TO_CHAR(OrderDate, 'YYYY-MM-DD') AS sale_date,
  Price AS price_at_that_time,
  SUM(Quantity) AS units_sold
FROM price_history_ranked
WHERE rn = 1
GROUP BY TO_CHAR(OrderDate, 'YYYY-MM-DD'), Price
ORDER BY sale_date

      `,
      [Number(productId)],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Analytics fetch error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  } finally {
    if (connection) await connection.close();
  }
};
