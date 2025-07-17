import { connectDB } from "../db/dbconnect.js"; // Adjust this to your DB connection file
import oracledb from "oracledb";


export const addReview = async (req, res) => {
  const { productId, ratingValue, commentText, imageId } = req.body;
  const customerId = req.user.USERID; // 

  if (!productId || !ratingValue || !customerId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  let conn;
  try {
    conn = await connectDB();

    const result = await conn.execute(
      `INSERT INTO Review (ProductID, CustomerID, RatingValue, CommentText, ImageID)
       VALUES (:productId, :customerId, :ratingValue, :commentText, :imageId)`,
      { productId, customerId, ratingValue, commentText, imageId },
      { autoCommit: true }
    );

  await conn.execute(
  `UPDATE PRODUCT
   SET AVERAGERATING = (
     SELECT AVG(RATINGVALUE)
     FROM REVIEW
     WHERE PRODUCTID = :productId
   )
   WHERE PRODUCTID = :productId`,
  {productId},
  { autoCommit: true }
);

    await conn.execute(
  `UPDATE SELLER
   SET RATING = (
     SELECT AVG(RATINGVALUE)
     FROM REVIEW R JOIN PRODUCT P
     ON R.PRODUCTID = P.PRODUCTID
     WHERE P.SELLERID = ( SELECT SELLERID FROM PRODUCT WHERE PRODUCTID = :productId)
     )
   WHERE SELLERID = ( SELECT SELLERID FROM PRODUCT WHERE PRODUCTID = :productId)`,
  {productId},
  { autoCommit: true }
);

    res.status(201).json({ message: "Review added successfully." });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    if (conn) await conn.close();
  }
};


export const getReviewsByProduct = async (req, res) => {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  let conn;
  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT R.ReviewID, R.RatingValue, R.CommentText, R.CreatedAt, R.ImageID, 
              S.UserID, S.Name AS CustomerName
         FROM Review R
         JOIN ServiceUser S ON R.CustomerID = S.UserID
        WHERE R.ProductID = :productId
        ORDER BY R.CreatedAt DESC`,
      { productId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error.message, error.stack);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    if (conn) await conn.close();
  }
};
