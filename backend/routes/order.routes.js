import express from "express";
import { protectRoute } from "../middleware/protectroute.js";
import { createOrder } from "../controllers/order.controllers.js";
import { transaction } from "../controllers/order.controllers.js";
const router = express.Router();
router.post("/add",protectRoute,createOrder);
router.post("/trx",transaction);

export default router;