import bcrypt from "bcryptjs";
import { connectDB } from "../db/dbconnect.js";
import oracledb from "oracledb";
import { generateTokenAndSetCookies } from "../lib/utils/generateToken.js";
import cloudinary from '../lib/utils/cloudinary.js'; 
export const sellersignup = async (req, res) => {
  let conn;
  try {
    const { name, email, password, phone, dateOfBirth, gender, storeName, storeDescription, walletUsername } = req.body;

    if (!walletUsername) {
      return res.status(400).json({ error: "Missing wallet info. Please add a payment system." });
    }

    conn = await connectDB();

    const userByEmail = await conn.execute(
      `SELECT * FROM SERVICEUSER WHERE Email = :email`,
      [email]
    );
    if (userByEmail.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const userByPhone = phone ? await conn.execute(
      `SELECT * FROM SERVICEUSER WHERE Phone = :phone`,
      [phone]
    ) : null;
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
        userId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const newUserId = result.outBinds.userId[0];

    await conn.execute(
      `INSERT INTO SELLER (SellerID, StoreName, StoreDescription, WalletUser)
       VALUES (:userId, :storeName, :storeDescription, :walletUsername)`,
      {
        userId: newUserId,
        storeName,
        storeDescription,
        walletUsername
      }
    );

    generateTokenAndSetCookies(newUserId, res);

    res.status(201).json({
      UserID: newUserId,
      Name: name,
      Email: email,
      Phone: phone,
      DateOfBirth: dateOfBirth,
      Gender: gender,
      StoreName: storeName,
      StoreDescription: storeDescription
    });
    await conn.commit();

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

    const newUserId = result.outBinds.userId[0];

    await conn.execute(
      `INSERT INTO CUSTOMER (CustomerID)
       VALUES (:userId)`,
      {
        userId: newUserId,
      }
    );

    generateTokenAndSetCookies(newUserId, res);

    await conn.commit();

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




export const sellerLogin = async (req, res) => {
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
      return res.status(400).json({ error: "User not found" });
    }

    const isPassCorrect = await bcrypt.compare(password, user["PASSWORDHASH"]);
    if (!isPassCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const sellerCheck = await conn.execute(
      `SELECT * FROM SELLER WHERE SELLERID = :id`,
      [user["USERID"]],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (sellerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied. Not a seller." });
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
    console.error("Error in seller login: ", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};

export const sellerWallet = async (req, res) => {
  let conn;  
  try {
    console.log("Seller Wallet khujchi");
    const { id } = req.params;
    
    conn = await connectDB();
    const result = await conn.execute(
      `SELECT WalletUser FROM SELLER WHERE SELLERID = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    // Check if seller exists
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }
    
    const user = result.rows[0]; 
    
    if (!user.WALLETUSER) {
      return res.status(404).json({ error: "Seller wallet not configured" });
    }
    
    res.status(200).json({
      walletUserName: user.WALLETUSER, 
    });
    
  } catch (err) {
    console.error("Error in seller wallet: ", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    // Always close connection
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};

// CUSTOMER LOGIN
export const customerLogin = async (req, res) => {
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
      return res.status(400).json({ error: "User not found" });
    }

    const isPassCorrect = await bcrypt.compare(password, user["PASSWORDHASH"]);
    if (!isPassCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if user is a customer
    const customerCheck = await conn.execute(
      `SELECT * FROM CUSTOMER WHERE CUSTOMERID = :id`,
      [user["USERID"]],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (customerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied. Not a customer." });
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
    console.error("Error in customer login: ", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};



export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const adminEmail = "admin@deshicart.com";
    const adminPassword = "admin123"; 

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    
    const adminUserId = -1000;

    generateTokenAndSetCookies(adminUserId, res);

    res.status(200).json({
      UserID: adminUserId,
      Name: "Admin",
      Email: adminEmail,
      Role: "admin",
    });
  } catch (err) {
    console.error("Error in admin login: ", err.message);
    res.status(500).json({ error: "Server error" });
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



export const getSellerProfile = async (req, res) => {
  let conn;
  try {
    const sellerId = req.user.USERID;

    conn = await connectDB();

    const result = await conn.execute(
      `
      SELECT
        su.USERID,
        su.NAME,
        su.EMAIL,
        su.PHONE,
        su.PROFILEIMAGE,
        s.STORENAME,
        s.STOREDESCRIPTION
      FROM SERVICEUSER su
      JOIN SELLER s ON su.USERID = s.SELLERID
      WHERE su.USERID = :sellerId
      `,
      { sellerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }

    res.json(result.rows[0]); 
  } catch (err) {
    console.error("Error fetching seller profile:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};


export const updateSellerProfile = async (req, res) => {
  let conn;
  try {
    const sellerId = req.user.USERID;
    const { name, storename, description, walletUsername, walletPassword } = req.body;

    let profilePicUrl;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      profilePicUrl = uploadResult.secure_url;
    }

    conn = await connectDB();

    const existing = await conn.execute(
      `SELECT su.NAME, su.PHONE, su.PROFILEIMAGE, s.STORENAME, s.STOREDESCRIPTION, s.WALLETID
       FROM SERVICEUSER su JOIN SELLER s ON su.USERID = s.SELLERID
       WHERE su.USERID = :sellerId`,
      { sellerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows.length === 0) {
      return res.status(404).send("Seller not found");
    }

    const old = existing.rows[0];

    let newWalletId = old.WALLETID;

    // 🔐 Step 1: Authenticate wallet if username & password are provided
    if (walletUsername && walletPassword) {
      try {
        const walletRes = await fetch("http://localhost:5050/api/auth/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: walletUsername,
            password: walletPassword,
          }),
        });

        const walletData = await walletRes.json();

        if (!walletData.success) {
          return res.status(400).json({ error: "Wallet credentials are incorrect!" });
        }

        newWalletId = walletData.walletUserId;
      } catch (err) {
        console.error("Wallet auth failed:", err);
        return res.status(500).json({ error: "Wallet authentication failed" });
      }
    }

    // 🔄 Step 2: Update SERVICEUSER
    await conn.execute(
      `UPDATE SERVICEUSER
       SET NAME = :name,
           PROFILEIMAGE = :profilePic
       WHERE USERID = :sellerId`,
      {
        name: name || old.NAME,
        profilePic: profilePicUrl || old.PROFILEIMAGE,
        sellerId,
      }
    );

    // 🔄 Step 3: Update SELLER (including WALLETID)
    await conn.execute(
      `UPDATE SELLER
       SET STORENAME = :storename,
           STOREDESCRIPTION = :description,
           WALLETID = :walletId
       WHERE SELLERID = :sellerId`,
      {
        storename: storename || old.STORENAME,
        description: description || old.STOREDESCRIPTION,
        walletId: newWalletId,
        sellerId,
      }
    );

    await conn.commit();
    res.send("Profile updated successfully");

  } catch (err) {
    console.error("Error updating seller profile:", err);
    res.status(500).send("Internal server error");
  } finally {
    if (conn) await conn.close();
  }
};



export const changeSellerPassword = async (req, res) => {
  let conn;
  try {
    const sellerId = req.user.USERID;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    conn = await connectDB();

    // Get existing hashed password
    const result = await conn.execute(
      `SELECT PASSWORDHASH FROM SERVICEUSER WHERE USERID = :sellerId`,
      { sellerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashed = result.rows[0].PASSWORDHASH;

    // Compare current password
    const match = await bcrypt.compare(currentPassword, hashed);
    if (!match) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // Hash and update new password
    const newHashed = await bcrypt.hash(newPassword, 10);
    await conn.execute(
      `UPDATE SERVICEUSER SET PASSWORDHASH = :newPassword WHERE USERID = :sellerId`,
      { newPassword: newHashed, sellerId }
    );

    await conn.commit();
    res.send("Password updated successfully");
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).send("Internal server error");
  } finally {
    if (conn) await conn.close();
  }
};

export const getCustomerProfile = async (req, res) => {
  let conn;
  try {
    const customerId = req.user.USERID;

    conn = await connectDB();

    const result = await conn.execute(
      `
      SELECT
        su.USERID,
        su.NAME,
        su.EMAIL,
        su.PHONE,
        su.PROFILEIMAGE
      FROM SERVICEUSER su
      JOIN CUSTOMER c ON su.USERID = c.CUSTOMERID
      WHERE su.USERID = :customerId
      `,
      { customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]); 
  } catch (err) {
    console.error("Error fetching customer profile:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
};



