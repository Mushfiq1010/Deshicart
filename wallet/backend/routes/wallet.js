import express from 'express';
import { getWallet, deposit, withdraw } from '../models/walletModel.js';
import {auth} from '../middleware/auth.js';
import {db} from '../config/db.js';
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const wallet = await getWallet(req.user.id);
  res.json(wallet);
});

router.post('/deposit', auth, async (req, res) => {
  const { amount} = req.body;
  await deposit(req.user.id, parseFloat(amount));
  res.json({ message: "Deposit successful" });
});

router.post('/withdraw', auth, async (req, res) => {
  const { amount} = req.body;
  try {
    await withdraw(req.user.id, parseFloat(amount));
    res.json({ message: "Withdraw successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/trx', async (req, res) => {
  let connection;
  const {amount , sender, receiver } = req.body;
  try {
    connection = await db.getConnection();
    
    // Start transaction (Oracle uses implicit transactions)
    // Check sender balance with row locking
    const senderResult = await connection.execute(
      `SELECT balance FROM wallets WHERE username = :sender FOR UPDATE`,
      [sender]
    );
    
    if (senderResult.rows.length === 0) {
      throw new Error('Sender wallet not found');
    }
    
    const senderBalance = senderResult.rows[0].BALANCE;
    if (senderBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Withdraw from sender
    const withdrawResult = await connection.execute(
  `UPDATE wallets SET balance = balance - :amount WHERE username = :sender`,
  [amount, sender]
);
    
    if (withdrawResult.rowsAffected === 0) {
      throw new Error('Failed to withdraw from sender');
    }
    
    // Deposit to receiver
    const depositResult = await connection.execute(
      `UPDATE wallets SET balance = balance + :amount WHERE username = :receiver`,
      [amount, receiver]
    );
    
    if (depositResult.rowsAffected === 0) {
      throw new Error('Failed to deposit to receiver');
    }
    
    
    await connection.commit();
    
  res.json({ 
  success: true, 
  message: 'Transfer completed successfully',
  withdrawnAmount: amount,
  depositedAmount: amount
});
    
  } catch (error) {
  if (connection) {
    await connection.rollback();
  }
  
  // Add this:
  res.status(400).json({
    success: false,
    message: error.message
  });
}finally {
    // Always release connection back to pool
    if (connection) {
      await connection.close();
    }
  }
});

export default router;
