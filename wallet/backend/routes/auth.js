const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findByUsername } = require('../models/userModel');
const router = express.Router();
require('dotenv').config();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashed);
    res.json({ message: "Registered successfully", userId: user.id });
  } catch (e) {
    res.status(400).json({ message: "Registration failed", error: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.PASSWORD_HASH))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.ID, username: user.USERNAME }, process.env.JWT_SECRET);
  res.json({ token });
});

router.post('/authenticate', async (req, res) => {
  const { username, password } = req.body;
  const user = await findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.PASSWORD_HASH))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  res.status(200).json({ success: true, walletUserId: user.ID });
});

module.exports = router;
