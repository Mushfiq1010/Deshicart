import express from "express";
import upload from "../middleware/upload.js";
import {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  getSellerProducts
} from "../controllers/product.controllers.js";

import { protectRoute } from "../middleware/protectroute.js";

const router = express.Router();

router.get("/", protectRoute,getSellerProducts);
router.get("/:id", getProduct);
router.post("/add", protectRoute,upload.array("images"), createProduct);
router.delete("/:id", protectRoute, deleteProduct);
router.patch("/:id", protectRoute, updateProduct);

export default router;

