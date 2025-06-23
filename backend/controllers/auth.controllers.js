import bcrypt from "bcryptjs";
import { connectDB } from "../db/dbconnect.js";
import oracledb from "oracledb";
import { generateTokenAndSetCookies } from "../lib/utils/generateToken.js";

export const sellersignup = async (req, res) => {
  let conn;
  try {
    const { name, email, password, phone, dateOfBirth, gender,storeName, storeDescription } = req.body;


    conn = await connectDB();

    const userByEmail = await conn.execute(
      `SELECT * FROM SERVICEUSER WHERE Email = :email`,
      [email]
    );
    if (userByEmail.rows.length > 0) {
      console.log("email");
      
      return res.status(400).json({ error: "Email already in use" });
    }

    const userByPhone = phone ? await conn.execute(
      `SELECT * FROM SERVICEUSER WHERE Phone = :phone`,
      [phone]
    ) : null;
    if (userByPhone && userByPhone.rows.length > 0) {
      console.log("phone");
      
      return res.status(400).json({ error: "Phone number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await conn.execute(
      `INSERT INTO SERVICEUSER (Name, Email, PasswordHash, Phone, DateOfBirth, Gender)
       VALUES (:name, :email, :passwordHash, :phone, :dateOfBirth, :gender)
       RETURNING UserID INTO :userId`,
      {
        name,
        email,
        passwordHash: hashedPassword,
        phone: phone || null,
         dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        userId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    await conn.commit();

    const newUserId = result.outBinds.userId[0];

    

        await conn.execute(
      `INSERT INTO SELLER (SellerID, StoreName, StoreDescription)
       VALUES (:userId, :storeName, :storeDescription)`,
      {
        userId: newUserId,
        storeName,
        storeDescription
      },
      { autoCommit: true }
    );

    generateTokenAndSetCookies(newUserId, res);

    res.status(201).json({
      UserID: newUserId,
      Name: name,
      Email: email,
      Phone: phone,
      DateOfBirth: dateOfBirth,
      Gender: gender,
      ProfileImage: null,
      CreatedAt: new Date(),
       StoreName: storeName,
      StoreDescription: storeDescription
    });

  } catch (err) {
    console.error("Error in signup: ", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};


export const customersignup = async (req, res) => {
  let conn;
  try {
    const { name, email, password, phone, dateOfBirth, gender } = req.body;

    conn = await connectDB();

    const userByEmail = await conn.execute(
      `SELECT * FROM SERVICEUSER WHERE Email = :email`,
      [email]
    );
    if (userByEmail.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const userByPhone = phone
      ? await conn.execute(`SELECT * FROM SERVICEUSER WHERE Phone = :phone`, [phone])
      : null;
    if (userByPhone && userByPhone.rows.length > 0) {
      return res.status(400).json({ error: "Phone number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await conn.execute(
      `INSERT INTO SERVICEUSER (Name, Email, PasswordHash, Phone, DateOfBirth, Gender)
       VALUES (:name, :email, :passwordHash, :phone, :dateOfBirth, :gender)
       RETURNING UserID INTO :userId`,
      {
        name,
        email,
        passwordHash: hashedPassword,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        userId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await conn.commit();

    const newUserId = result.outBinds.userId[0];

    await conn.execute(
      `INSERT INTO CUSTOMER (CustomerID)
       VALUES (:userId)`,
      {
        userId: newUserId,
      },
      { autoCommit: true }
    );

    generateTokenAndSetCookies(newUserId, res);

    res.status(201).json({
      UserID: newUserId,
      Name: name,
      Email: email,
      Phone: phone,
      DateOfBirth: dateOfBirth,
      Gender: gender,
      ProfileImage: null,
      CreatedAt: new Date(),
    });
  } catch (err) {
    console.error("Error in customer signup: ", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};




export const login = async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;


    conn = await connectDB();

    const userResult = await conn.execute(
      `SELECT * FROM SERVICEUSER WHERE Email = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const user = userResult.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

  const isPassCorrect = await bcrypt.compare(password, user["PASSWORDHASH"]);


    if (!isPassCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

        generateTokenAndSetCookies(user["USERID"], res);


    res.status(200).json({
      UserID: user["USERID"],
      Name: user["NAME"],
      Email: user["EMAIL"],
      Phone: user["PHONE"],
      DateOfBirth: user["DATEOFBIRTH"],
      Gender: user["GENDER"],
      ProfileImage: user["PROFILEIMAGE"],
      CreatedAt: user["CREATEDAT"],
    });

  } catch (err) {
    console.error("Error in login: ", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};


export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error in logout:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

