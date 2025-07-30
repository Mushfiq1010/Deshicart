import oracledb from "oracledb";
import { connectDB } from "../db/dbconnect.js";

export const addToCart = async (req, res) => {
  const customerId = req.user.USERID;
  console.log(customerId);

  const { productId, quantity } = req.body;

  if (!customerId || !productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  let conn;
  try {
    conn = await connectDB();

    const existing = await conn.execute(
      `SELECT CartItemID, Quantity FROM CartItems WHERE CustomerID = :custId AND ProductID = :prodId`,
      { custId: customerId, prodId: productId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows.length > 0) {
      const { CARTITEMID, QUANTITY } = existing.rows[0];
      await conn.execute(
        `UPDATE CartItems SET Quantity = :newQty WHERE CartItemID = :id`,
        { newQty: QUANTITY + quantity, id: CARTITEMID }
      );
    } else {
      await conn.execute(
        `INSERT INTO CartItems (CustomerID, ProductID, Quantity) VALUES (:custId, :prodId, :qty)`,
        { custId: customerId, prodId: productId, qty: quantity }
      );
    }

    await conn.commit();
    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const getCartItems = async (req, res) => {
  const customerId = req.user.USERID;
  let conn;

  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT 
         ci.CartItemID,
         p.ProductID,
         p.Name,
         p.Price,
         p.CategoryId,
         c.RootCategoryID,
         s.walletUser AS SellerWalletId,
         ci.Quantity,
         (p.Price * ci.Quantity) AS Subtotal
       FROM 
         CartItems ci
       JOIN 
         Product p ON ci.ProductID = p.ProductID
        JOIN
         Category c ON p.CategoryId = c.CategoryID
        JOIN
        Seller s ON p.SellerID = s.SellerID
       WHERE 
         ci.CustomerID = :custId`,
      { custId: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const cartItems = result.rows;
    const total = cartItems.reduce((sum, item) => sum + item.SUBTOTAL, 0);

    res.status(200).json({ cart: cartItems, total });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const removeFromCart = async (req, res) => {
  const customerId = req.user.USERID;
  const { cartItemId } = req.body;

  if (!customerId || !cartItemId) {
    return res.status(400).json({ message: "Invalid input" });
  }

  let conn;
  try {
    conn = await connectDB();

    await conn.execute(
      `DELETE FROM CartItems WHERE CartItemID = :cartItemId AND CustomerID = :custId`,
      { cartItemId, custId: customerId }
    );

    await conn.commit();
    res.status(200).json({ message: "Item removed from cart." });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const updateCartQuantity = async (req, res) => {
  const customerId = req.user.USERID;
  const { cartItemId, quantity } = req.body;

  if (!customerId || !cartItemId || quantity == null || quantity < 1) {
    return res.status(400).json({ message: "Invalid input" });
  }

  let conn;
  try {
    conn = await connectDB();

    await conn.execute(
      `UPDATE CartItems SET Quantity = :quantity WHERE CartItemID = :cartItemId AND CustomerID = :custId`,
      { quantity, cartItemId, custId: customerId }
    );

    await conn.commit();
    res.status(200).json({ message: "Cart quantity updated." });
  } catch (err) {
    console.error("Update cart quantity error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const placeOrder = async (req, res) => {
  const customerId = req.user.USERID;
  let conn;

  try {
    conn = await connectDB();
    const cartItems = req.body.cartItems || [];
    const isCart = req.body.isCart || false;

    let subTotal = 0;
    let total = 0;
    for (const item of cartItems) {
      subTotal += item.SUBTOTAL;
      total += item.SUBTOTAL + item.vatAmount;
    }
    const status = "P";

    const payId = req.body.payId;
    const cityid = req.body.cityid;
    const street = req.body.street;

    const result1 = await conn.execute(
      `INSERT INTO ADMIN.SHIPPINGADDRESS (STREETADDRESS, CITYID)
       VALUES (:street, :cityid)
       RETURNING ADDRESSID INTO :addressId`,
      {
        street,
        cityid,
        addressId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    const addressId = result1.outBinds.addressId[0];

    const result2 = await conn.execute(
      `INSERT INTO ADMIN.SHIPMENT (SHIPPINGADDRESSID, ARRIVALDATE)
       VALUES (:addressId, SYSDATE + 5)
       RETURNING SHIPMENTID INTO :shipmentId`,
      {
        addressId,
        shipmentId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    const shipmentId = result2.outBinds.shipmentId[0];

    const orderResult = await conn.execute(
      `INSERT INTO ProductOrder (CustomerID, SubTotal, Total, Status,PaymentID, ShipmentID)
       VALUES (:custId, :subTotal, :total, :status, :payId, :shipmentId)
       RETURNING OrderID INTO :orderId`,
      {
        custId: customerId,
        subTotal,
        total,
        status,
        payId,
        shipmentId,
        orderId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      }
    );

    const orderId = orderResult.outBinds.orderId[0];

    for (const item of cartItems) {
      const itemTotal = item.SUBTOTAL + (item.vatRate * item.SUBTOTAL) / 100;
      await conn.execute(
        `INSERT INTO OrderItem (OrderID, ProductID, Quantity, Price, Total, Taxrate)
         VALUES (:orderId, :prodId, :qty, :price, :total, :taxrate)`,
        {
          orderId,
          prodId: item.PRODUCTID,
          qty: item.QUANTITY,
          price: item.PRICE,
          total: itemTotal,
          taxrate: item.vatRate || 0,
        }
      );
    }

    if (isCart) {
      await conn.execute(`DELETE FROM CartItems WHERE CustomerID = :custId`, {
        custId: customerId,
      });
    }

    await conn.commit();
    res
      .status(200)
      .json({ success: true, message: "Order placed successfully." });
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ success: true, message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const addWishListItem = async (req, res) => {
  const customerId = req.user.USERID;
  const { productId } = req.body;

  if (!customerId || !productId) {
    return res.status(400).json({ message: "Invalid input" });
  }

  let conn;
  try {
    conn = await connectDB();

    const existing = await conn.execute(
      `SELECT WishlistID FROM WishlistItem WHERE CustomerID = :custId AND ProductID = :prodId`,
      { custId: customerId, prodId: productId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    await conn.execute(
      `INSERT INTO WishlistItem (CustomerID, ProductID) VALUES (:custId, :prodId)`,
      { custId: customerId, prodId: productId }
    );

    await conn.commit();
    res.status(200).json({ message: "Product added to wishlist successfully" });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const getWishlistItems = async (req, res) => {
  const customerId = req.user.USERID;
  let conn;

  try {
    conn = await connectDB();

    const result = await conn.execute(
      `SELECT 
         p.PRODUCTID, p.NAME, p.DESCRIPTION, p.PRICE, p.QUANTITY, p.CATEGORYID, p.SELLERID, p.AVERAGERATING, i.IMAGEURL
       FROM 
         WishlistItem wi
         LEFT JOIN PRODUCT p ON wi.ProductID = p.ProductID
       LEFT JOIN PRODUCTIMAGE pi ON p.PRODUCTID = pi.PRODUCTID
            AND pi.IMAGEID = (
                SELECT MIN(IMAGEID)
                FROM PRODUCTIMAGE
                WHERE PRODUCTID = p.PRODUCTID
            )
            LEFT JOIN IMAGE i ON pi.IMAGEID = i.IMAGEID
       WHERE
       CUSTOMERID = :custId`,
      { custId: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (conn) await conn.close();
  }
};

export const removeFromWishlist = async (req, res) => {
  const customerId = req.user.USERID;
  const productId = Number(req.params.productId);
  let conn;

  try {
    conn = await connectDB();

    const result = await conn.execute(
      `DELETE FROM WishlistItem
       WHERE CustomerID = :custId AND ProductID = :prodId`,
      { custId: customerId, prodId: productId }
    );

    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in wishlist" });
    }

    await conn.commit();
    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};
