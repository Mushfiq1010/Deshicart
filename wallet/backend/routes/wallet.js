const express = require('express');
const { getWallet, deposit, withdraw } = require('../models/walletModel');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const wallet = await getWallet(req.user.id);
  res.json(wallet);
});

router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  await deposit(req.user.id, parseFloat(amount));
  res.json({ message: "Deposit successful" });
});

router.post('/withdraw', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    await withdraw(req.user.id, parseFloat(amount));
    res.json({ message: "Withdraw successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
