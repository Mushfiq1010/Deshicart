import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { getAllOrders, getSellerOrderHistory, transaction } from "../controllers/order.controllers.js";
const router = express.Router();
router.post("/trx",transaction);
router.get("/", protectRoute, getAllOrders);
router.get("/sales", protectRoute, getSellerOrderHistory);
export default router;