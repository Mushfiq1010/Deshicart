import express from "express";
import { getAllProducts, adminDeleteProduct,deleteSeller,getTopOrderedProducts,getOrderHistory, getTopSellers } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/protectroute.js";
import { getSellers,getCustomers } from "../controllers/admin.controller.js";
import { getCategories,submitCategories,addSingleCategory } from "../controllers/category.controllers.js";
const router = express.Router();


router.get("/products", protectRoute, getAllProducts);
router.delete("/products/:id", protectRoute, adminDeleteProduct);
router.delete("/sellers/:sellerId", protectRoute,  deleteSeller);
router.get("/users/sellers", protectRoute,  getSellers);
router.get("/users/customers", protectRoute,  getCustomers);
router.get("/categories", protectRoute,  getCategories);
router.post("/addcategories", protectRoute,  submitCategories);
router.post("/categories/:parentid/add", addSingleCategory);
router.get("/products/top", getTopOrderedProducts);
router.get('/orders/history', protectRoute, getOrderHistory);
router.get('/top-sellers', protectRoute, getTopSellers);
export default router;
