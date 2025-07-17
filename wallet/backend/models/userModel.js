const db = require('../config/db');

exports.createUser = async (username, hashedPassword) => {
  const conn = await db.getConnection();

  await conn.execute(
    `INSERT INTO walletusers (username, password_hash) VALUES (:username, :password)`,
    { username, password: hashedPassword },
    { autoCommit: true }
  );

  const result = await conn.execute(`SELECT id FROM walletusers WHERE username = :username`, { username });
  const userId = result.rows[0].ID;

  await conn.execute(`INSERT INTO wallets (user_id, balance) VALUES (:user_id, 0)`, { user_id: userId }, { autoCommit: true });

  await conn.close();
  return { id: userId, username };
};

exports.findByUsername = async (username) => {
  const conn = await db.getConnection();
  const result = await conn.execute(`SELECT * FROM walletusers WHERE username = :username`, { username });
  await conn.close();
  return result.rows.length ? result.rows[0] : null;
};
