import express from "express";
import { getAllProducts, adminDeleteProduct,deleteSeller,getTopOrderedProducts,getOrderHistory, getTopSellers, getActiveVat, getPendingOrders, getCity } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/protectroute.js";
import { getSellers,getCustomers, getVatByCategory,addOrUpdateVat,acceptOrder,declineOrder, addCity } from "../controllers/admin.controller.js";
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
router.get('/vat/:categoryid', protectRoute, getVatByCategory);
router.get('/pending-orders', protectRoute, getPendingOrders);
router.post("/accept-order/:id", acceptOrder);
router.post("/decline-order/:id", declineOrder);
router.post('/vat', protectRoute, addOrUpdateVat);
router.post("/cities",protectRoute, addCity);
router.get("/cities",protectRoute, getCity);
router.get('/vat/active/:categoryid', protectRoute, getActiveVat);
export default router;
