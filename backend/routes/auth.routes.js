import express from "express";
import { customersignup, login,logout, sellersignup } from "../controllers/auth.controllers.js";


const router=express.Router();

router.post("/seller/signup",sellersignup);
router.post("/customer/signup",customersignup);

router.post("/seller/login",login);
router.post("/customer/login",login);

router.post("/logout",logout);


export default router;