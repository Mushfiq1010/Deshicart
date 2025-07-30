import express from "express";
import { getWallet, deposit, withdraw } from "../models/walletModel.js";
import { auth } from "../middleware/auth.js";
import { db } from "../config/db.js";
import { findByUsername } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import oracledb from "oracledb"

dotenv.config();

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const wallet = await getWallet(req.user.id);
  res.json(wallet);
});

router.post("/deposit", auth, async (req, res) => {
  const { amount } = req.body;
  await deposit(req.user.id, parseFloat(amount));
  res.json({ message: "Deposit successful" });
});

router.post("/withdraw", auth, async (req, res) => {
  const { amount } = req.body;
  try {
    await withdraw(req.user.id, parseFloat(amount));
    res.json({ message: "Withdraw successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/checkout-cart", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.DESHICART_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request",
    });
  }

  const { transactions, username, password, customerId } = req.body;
  let connection;
  try {
    const user = await findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.PASSWORD_HASH))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const buyerId = user.ID;

    connection = await db.getConnection();
    const balanceResult = await connection.execute(
      `SELECT balance FROM wallets WHERE username = :username FOR UPDATE`,
      { username }
    );

    if (balanceResult.rows.length === 0) {
      throw new Error("Buyer wallet not found");
    }

    const paymentResult = await connection.execute(
      `INSERT INTO PAYMENT (CUSTOMERID) VALUES (:customerId) RETURNING PAYMENTID INTO :paymentId`,
      {
        customerId,
        paymentId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      }
    );
    const paymentId = paymentResult.outBinds.paymentId[0];

    let balance = balanceResult.rows[0].BALANCE;
    let globalTotal = 0;

    for (const trx of transactions) {
      const { amount, sellerWallet, vatAmount } = trx;

      const seller = await findByUsername(sellerWallet);
      if (!seller) {
        throw new Error(`Invalid seller wallet: ${sellerWallet}`);
      }

      if (balance < amount + vatAmount) {
        throw new Error("Insufficient balance");
      }

      const totalAmount = amount + vatAmount;
      const withdrawResult = await connection.execute(
        `UPDATE wallets SET balance = balance - :amount WHERE username = :username`,
        { amount: totalAmount, username }
      );
      if (withdrawResult.rowsAffected === 0)
        throw new Error("Failed to withdraw");

      const depositResult = await connection.execute(
        `UPDATE wallets SET balance = balance + :amount WHERE username = :receiver`,
        { amount, receiver: sellerWallet }
      );
      if (depositResult.rowsAffected === 0)
        throw new Error("Failed to deposit");

      const taxDeposit = await connection.execute(
        `UPDATE wallets SET balance = balance + :amount WHERE username = :receiver`,
        { amount: vatAmount, receiver: "GOB" }
      );
      if (taxDeposit.rowsAffected === 0) throw new Error("Failed to deposit");

      await connection.execute(
        `INSERT INTO transactions (user_id, type, amount, paymentid) VALUES (:id, 'withdraw', :amount, :pid)`,
        { id: buyerId, amount: totalAmount, pid: paymentId }
      );
      await connection.execute(
        `INSERT INTO transactions (user_id, type, amount, paymentid) VALUES (:id, 'deposit', :amount, :pid)`,
        { id: seller.ID, amount, pid: paymentId }
      );
      await connection.execute(
        `INSERT INTO transactions (user_id, type, amount, paymentid) VALUES (:id, 'deposit', :amount, :pid)`,
        { id: 61, amount: vatAmount, pid: paymentId } // GOB's user ID is 61
      );

      balance -= amount + vatAmount;
      globalTotal += amount + vatAmount;
    }

    await connection.commit();

    res.json({
      success: true,
      message: "All payments processed successfully",
      totalPaid: globalTotal,
      paymentId
    });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.post("/balance-check", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.DESHICART_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request",
    });
  }
  const { amount, username } = req.body;
  const user = await findByUsername(username);
  const conn = await db.getConnection();
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "User doesn't exist" });
  }
  const result = await conn.execute(
    `SELECT balance FROM wallets WHERE username = :username`,
    { username }
  );
  const balance = result.rows[0].BALANCE;
  if (balance < amount) {
    await conn.close();
    return res.json({ success: false });
  }
  await conn.close();
  return res.json({ success: true });
});

export default router;
