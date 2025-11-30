import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { sendOrderEmail } from '../utils/sendEmail.js';

const router = express.Router();

// This route is only intended for temporary debugging.
// Use ALLOW_DEBUG_ENDPOINTS env var set to 'true' to enable in production.
router.get('/cart', protect, async (req, res) => {
  if (process.env.ALLOW_DEBUG_ENDPOINTS !== 'true') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    const user = await User.findById(req.userId);
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Debug cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send a test email to the currently authenticated user (temporary debug route)
router.post('/email-test', protect, async (req, res) => {
  if (process.env.ALLOW_DEBUG_ENDPOINTS !== 'true') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    const order = {
      _id: `debug-${Date.now()}`,
      orderDate: new Date(),
      totalPrice: cart ? cart.items.reduce((s, i) => s + ((i.product?.price || i.price) * i.quantity), 0) : 0,
      items: (cart?.items || []).map(i => ({ product: i.product?._id || i.product, name: i.product?.name || i.name, size: i.size, quantity: i.quantity, price: i.product?.price || i.price })),
      user: { _id: req.userId, name: user?.name || 'Test', email: user?.email || req.body?.email }
    };
    const result = await sendOrderEmail(order);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Debug send email error:', error);
    res.status(500).json({ success: false, message: 'Email send failed', error: error?.message || error });
  }
});

export default router;

