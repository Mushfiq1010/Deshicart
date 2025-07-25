import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findByUsername } from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

router.post('/authenticate', async (req, res) => {
  const { username, password } = req.body;
  const user = await findByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.PASSWORD_HASH))) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }
  
  res.json({ success: true});
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



export default router;
