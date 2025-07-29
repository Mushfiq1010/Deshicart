import express from 'express';
import { addToCart, getCartItems, placeOrder, removeFromCart, updateCartQuantity, addWishListItem, getWishlistItems, removeFromWishlist } from '../controllers/customer.controllers.js';
import { protectRoute } from '../middleware/protectroute.js';

const router = express.Router();


router.post('/addcart',protectRoute, addToCart);
router.post('/removecart',protectRoute, removeFromCart);
router.post('/updatecartquantity',protectRoute, updateCartQuantity);
router.get('/getcart', protectRoute, getCartItems);
router.post('/placeorder', protectRoute, placeOrder);
router.post('/wishlist/add', protectRoute, addWishListItem);
router.get('/wishlist', protectRoute,getWishlistItems);
router.delete('/wishlist/:productId', protectRoute, removeFromWishlist);
export default router;