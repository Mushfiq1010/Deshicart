import express from "express";
import { changeSellerPassword, customerLogin, customersignup, getSellerProfile,logout, sellerLogin, sellersignup, updateSellerProfile, getCustomerProfile, sellerWallet, adminLogin, changeCustomerPassword, updateCustomerProfile } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectroute.js";
import upload from "../middleware/upload.js";
const router=express.Router();

router.post("/seller/signup",sellersignup);
router.post("/customer/signup",customersignup);

router.post("/seller/login",sellerLogin);
router.post("/customer/login",customerLogin);
router.post("/admin/login", adminLogin);

router.post("/logout",logout);
router.get("/seller/getMe",protectRoute,getSellerProfile);
router.get("/seller/wallet/:id",sellerWallet);
router.post("/seller/update-profile", protectRoute,upload.single('profileImage'), updateSellerProfile);
router.post("/seller/change-password", protectRoute, changeSellerPassword);

router.get("/customer/getMe",protectRoute,getCustomerProfile);
router.post("/customer/update-profile", protectRoute,upload.single('profileImage'), updateCustomerProfile);
router.post("/customer/change-password", protectRoute, changeCustomerPassword);
export default router;