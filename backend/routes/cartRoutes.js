import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCart,
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update',   updateCart,);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;