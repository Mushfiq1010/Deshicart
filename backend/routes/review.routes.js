import express from "express";
import { addReview, getReviewsByProduct } from "../controllers/review.controllers.js";
import { protectRoute } from "../middleware/protectroute.js";

const router = express.Router();
router.post("/", protectRoute, addReview);
router.get("/:productId", getReviewsByProduct);

export default router;
