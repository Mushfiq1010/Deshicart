import express from "express";
import { changeSellerPassword, customerLogin, customersignup, getSellerProfile,logout, sellerLogin, sellersignup, updateSellerProfile } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectroute.js";
import upload from "../middleware/upload.js";
const router=express.Router();

router.post("/seller/signup",sellersignup);
router.post("/customer/signup",customersignup);

router.post("/seller/login",sellerLogin);
router.post("/customer/login",customerLogin);

router.post("/logout",logout);
router.get("/seller/getMe",protectRoute,getSellerProfile);
router.post("/seller/update-profile", protectRoute,upload.single('profileImage'), updateSellerProfile);
router.post("/seller/change-password", protectRoute, changeSellerPassword);
export default router;