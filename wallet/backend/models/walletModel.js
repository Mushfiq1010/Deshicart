const db = require('../config/db');

exports.getWallet = async (userId) => {
  const conn = await db.getConnection();

  const [walletResult, trxResult] = await Promise.all([
    conn.execute(`SELECT balance FROM wallets WHERE user_id = :id`, { id: userId }),
    conn.execute(`SELECT * FROM transactions WHERE user_id = :id ORDER BY created_at DESC`, { id: userId })
  ]);

  await conn.close();
  return {
    balance: walletResult.rows[0].BALANCE,
    transactions: trxResult.rows
  };
};

exports.deposit = async (userId, amount) => {
  const conn = await db.getConnection();

  await conn.execute(`UPDATE wallets SET balance = balance + :amount WHERE user_id = :id`, { amount, id: userId });
  await conn.execute(
    `INSERT INTO transactions (user_id, type, amount) VALUES (:id, 'deposit', :amount)`,
    { id: userId, amount },
    { autoCommit: true }
  );

  await conn.close();
};

exports.withdraw = async (userId, amount) => {
  const conn = await db.getConnection();

  const result = await conn.execute(`SELECT balance FROM wallets WHERE user_id = :id`, { id: userId });
  const balance = result.rows[0].BALANCE;

  if (balance < amount) {
    await conn.close();
    throw new Error("Insufficient balance");
  }

  await conn.execute(`UPDATE wallets SET balance = balance - :amount WHERE user_id = :id`, { amount, id: userId });
  await conn.execute(
    `INSERT INTO transactions (user_id, type, amount) VALUES (:id, 'withdraw', :amount)`,
    { id: userId, amount },
    { autoCommit: true }
  );

  await conn.close();
};
