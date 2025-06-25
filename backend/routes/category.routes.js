import {getCategories} from "../controllers/category.controllers.js";
import express from "express";

const router = express.Router();

router.get("/", getCategories);

export default router;
