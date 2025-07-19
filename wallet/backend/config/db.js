import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export const db = {
  getConnection: async () => {
    return await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING
    });
  }
};

