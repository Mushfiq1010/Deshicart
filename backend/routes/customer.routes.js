import express from 'express';
import { addToCart, getCartItems, placeOrder, removeFromCart, updateCartQuantity } from '../controllers/customer.controllers.js';
import { protectRoute } from '../middleware/protectroute.js';

const router = express.Router();


router.post('/addcart',protectRoute, addToCart);
router.post('/removecart',protectRoute, removeFromCart);
router.post('/updatecartquantity',protectRoute, updateCartQuantity);
router.get('/getcart', protectRoute, getCartItems);
router.post('/placeorder', protectRoute, placeOrder);

export default router;