import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendOrderEmail } from '../utils/sendEmail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (process.env.ALLOW_DEBUG_ENDPOINTS === 'true') {
      console.log('🔁 createOrder payload body:', JSON.stringify(req.body));
    }

    // Get user's cart - FIXED: using req.userId instead of req.user.id
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    console.log('🔍 createOrder for user:', req.userId, 'cartItems:', cart?.items?.length || 0);
    // Log items for debugging
    if (cart?.items?.length > 0) {
      console.log('🛒 cart items details:');
      cart.items.forEach((item, idx) => {
        const pid = item.product?._id || item.product;
        const name = item.product?.name || item.name || '(no name)';
        console.log(`  ${idx + 1}. productId: ${pid}, name: ${name}, size: ${item.size}, qty: ${item.quantity}`);
      });
    }
    if (!cart || cart.items.length === 0) {
      console.warn('⚠️ createOrder failed: cart empty for user:', req.userId);
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total and prepare order items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        console.warn('⚠️ createOrder: product reference missing for cart item', item);
        return res.status(400).json({
          success: false,
          message: `Product not found for cart item: productId=${item.product}`
        });
      }
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order - FIXED: using req.userId
    const startTime = Date.now();
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      totalPrice,
      shippingAddress
    });

    // Clear cart (server-side)
    try {
      cart.items = [];
      await cart.save();
    } catch (saveErr) {
      console.error('Failed to clear cart after order creation:', saveErr);
    }

    // Immediately respond to client with created order (without waiting for email population)
    res.status(201).json({
      success: true,
      order
    });
    console.log('✅ Order created and response sent for orderId:', order._id);

    // Continue background tasks asynchronously (do not block client response)
    (async () => {
      try {
        const populatedOrder = await Order.findById(order._id).populate('user');
        try {
          await sendOrderEmail(populatedOrder);
        } catch (emailError) {
          console.error('Email sending failed (background):', emailError);
        }
      } catch (bgError) {
        console.error('Background tasks after order creation failed:', bgError);
      } finally {
        console.log(`createOrder processed for user ${req.userId} in ${Date.now() - startTime}ms`);
      }
    })();
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: `Server error while creating order: ${error.message}`
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    // FIXED: using req.userId instead of req.user.id
    const orders = await Order.find({ user: req.userId })
      .sort({ orderDate: -1 })
      .populate('items.product');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user - FIXED: using req.userId
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

export { createOrder, getOrders, getOrderById };