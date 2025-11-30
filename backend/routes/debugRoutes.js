import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// This route is only intended for temporary debugging.
// Use ALLOW_DEBUG_ENDPOINTS env var set to 'true' to enable in production.
router.get('/cart', protect, async (req, res) => {
  if (process.env.ALLOW_DEBUG_ENDPOINTS !== 'true') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Debug cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
