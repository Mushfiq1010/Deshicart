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

  const token = jwt.sign({ id: user.ID, username: user.USERNAME }, process.env.JWT_SECRET);
  res.json({ success: true, token });
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

router.get('/', (req, res) => {
  const { redirect_uri } = req.query;
  // Always show the login form, even if req.session.user exists
  res.send(`
    <form method="POST" action="/api/auth/submit?redirect_uri=${encodeURIComponent(redirect_uri)}">
      <input name="username" placeholder="Wallet Username" required>
      <input name="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  `);
});

// POST /auth/submit?redirect_uri=...
router.post('/submit', async (req, res) => {
  const { username, password } = req.body;
  const { redirect_uri } = req.query;

  if (!username || !password) {
    return res.send('Missing username or password. <a href="/api/auth?redirect_uri=' + encodeURIComponent(redirect_uri) + '">Try again</a>');
  }

  try {
    const user = await findByUsername(username);
    if (!user) {
      return res.send('Invalid credentials. <a href="/api/auth?redirect_uri=' + encodeURIComponent(redirect_uri) + '">Try again</a>');
    }

    const passwordOk = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!passwordOk) {
      return res.send('Invalid credentials. <a href="/api/auth?redirect_uri=' + encodeURIComponent(redirect_uri) + '">Try again</a>');
    }

    // Redirect back to Deshicart with username
    return res.redirect(`${redirect_uri}?walletUsername=${encodeURIComponent(user.USERNAME)}`);
  } catch (err) {
    console.error(err);
    return res.send('Internal server error. <a href="/api/auth?redirect_uri=' + encodeURIComponent(redirect_uri) + '">Try again</a>');
  }
});

export default router;
