import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { createOrder } from "../controllers/order.controllers.js";
const router = express.Router();
router.post("/add",protectRoute,createOrder);

export default router;