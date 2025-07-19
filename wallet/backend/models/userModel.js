import {db} from '../config/db.js';

export const createUser = async (username, hashedPassword) => {
  const conn = await db.getConnection();

  await conn.execute(
    `INSERT INTO wallets (username, password_hash, balance) VALUES (:username, :password, 0)`,
    { username, password: hashedPassword },
    { autoCommit: true }
  );

  const result = await conn.execute(`SELECT id FROM wallets WHERE username = :username`, { username });
  const userId = result.rows[0].ID;

  await conn.close();
  return { id: userId, username };
};

export const findByUsername = async (username) => {
  const conn = await db.getConnection();
  const result = await conn.execute(`SELECT * FROM wallets WHERE username = :username`, { username });
  await conn.close();
  return result.rows.length ? result.rows[0] : null;
};
