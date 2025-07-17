import oracledb from 'oracledb';
import { connectDB } from '../db/dbconnect.js';

export const addToCart = async (req, res) => {
  const customerId = req.user.USERID;
  console.log(customerId);
  
  const { productId, quantity } = req.body;

  if (!customerId || !productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid input' });
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
    res.status(200).json({ message: 'Product added to cart successfully' });

  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Internal server error' });
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
         ci.Quantity,
         (p.Price * ci.Quantity) AS Subtotal
       FROM 
         CartItems ci
       JOIN 
         Product p ON ci.ProductID = p.ProductID
       WHERE 
         ci.CustomerID = :custId`,
      { custId: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const cartItems = result.rows;
    const total = cartItems.reduce((sum, item) => sum + item.SUBTOTAL, 0);

    res.status(200).json({ cart: cartItems, total });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Internal server error' });
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

    // Step 1: Fetch cart items with current prices
    const result = await conn.execute(
      `SELECT c.ProductID, c.Quantity, p.Price
       FROM CartItems c
       JOIN Product p ON c.ProductID = p.ProductID
       WHERE c.CustomerID = :custId`,
      { custId: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const cartItems = result.rows;
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let subTotal = 0;
    for (const item of cartItems) {
      subTotal += item.PRICE * item.QUANTITY;
    }
    const total = subTotal; 
    const status = 'y'; 

    const orderResult = await conn.execute(
      `INSERT INTO ProductOrder (CustomerID, SubTotal, Total, Status)
       VALUES (:custId, :subTotal, :total, :status)
       RETURNING OrderID INTO :orderId`,
      {
        custId: customerId,
        subTotal,
        total,
        status,
        orderId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const orderId = orderResult.outBinds.orderId[0];

    
    for (const item of cartItems) {
      const itemTotal = item.PRICE * item.QUANTITY;

      await conn.execute(
        `INSERT INTO OrderItem (OrderID, ProductID, Quantity, Price, Total)
         VALUES (:orderId, :prodId, :qty, :price, :total)`,
        {
          orderId,
          prodId: item.PRODUCTID,
          qty: item.QUANTITY,
          price: item.PRICE,
          total: itemTotal
        }
      );
    }

    await conn.execute(
      `DELETE FROM CartItems WHERE CustomerID = :custId`,
      { custId: customerId }
    );

    await conn.commit();
    res.status(200).json({ message: "Order placed successfully." });

  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};



