import {getCategories,getRootCategories} from "../controllers/category.controllers.js";
import express from "express";

const router = express.Router();

router.get("/", getCategories);
router.get("/roots", getRootCategories); // For compatibility with existing code

export default router;
