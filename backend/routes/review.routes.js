import express from "express";
import { addReview, getAllReplies, getReviewsByProduct, postReply } from "../controllers/review.controllers.js";
import { protectRoute } from "../middleware/protectroute.js";

const router = express.Router();
router.post("/", protectRoute, addReview);
router.get("/:productId", getReviewsByProduct);
router.get("/replies/:reviewId",protectRoute, getAllReplies);
router.post("/replies",protectRoute, postReply);
export default router;
