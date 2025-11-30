import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getAuthItem } from '../utils/authStorage';
import { cartAPI } from "../services/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart depending on login state
  useEffect(() => {
    if (user) {
      loadUserCart();
    } else {
      loadGuestCart();
    }
  }, [user]);

  const loadUserCart = async () => {
    try {
      setLoading(true);
      const token = getAuthItem('token');
      
      if (!token) {
        console.log('⚠️ No token found for cart load');
        loadGuestCart();
        return;
      }
      
      const res = await cartAPI.getCart();
      setCartItems(res.data.cart || []);
      console.log('✅ User cart loaded:', res.data.cart?.length || 0, 'items');
    } catch (error) {
      console.error("❌ Load user cart failed", error);
      
      // If 401, user might be logged out
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        loadGuestCart();
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGuestCart = () => {
    try {
      const data = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(data);
      console.log('✅ Guest cart loaded:', data.length, 'items');
    } catch {
      setCartItems([]);
    }
  };

  const saveGuestCart = (items) => {
    localStorage.setItem("guestCart", JSON.stringify(items));
  };

  const addToCart = async (product, size, quantity = 1) => {
    try {
      if (user) {
        console.log('🛒 Adding to user cart:', product.name, size, quantity);
        await cartAPI.addToCart({ productId: product._id, size, quantity });
        await loadUserCart(); // Reload to get updated cart
        return;
      }

      // Guest user
      console.log('🛒 Adding to guest cart:', product.name, size, quantity);
      const existing = cartItems.find(
        (i) => i.product === product._id && i.size === size
      );

      let updated;
      if (existing) {
        updated = cartItems.map((i) =>
          i.product === product._id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        updated = [
          ...cartItems,
          {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            size,
            quantity,
          },
        ];
      }

      setCartItems(updated);
      saveGuestCart(updated);
    } catch (error) {
      console.error('❌ Add to cart failed:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId, size, quantity) => {
    try {
      if (user) {
        await cartAPI.updateCart({ productId, size, quantity });
        await loadUserCart();
        return;
      }

      let updated = cartItems
        .map((i) =>
          i.product === productId && i.size === size ? { ...i, quantity } : i
        )
        .filter((i) => i.quantity > 0);

      setCartItems(updated);
      saveGuestCart(updated);
    } catch (error) {
      console.error('❌ Update cart failed:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      if (user) {
        await cartAPI.removeFromCart({ productId, size });
        await loadUserCart();
        return;
      }

      let updated = cartItems.filter(
        (i) => !(i.product === productId && i.size === size)
      );
      setCartItems(updated);
      saveGuestCart(updated);
    } catch (error) {
      console.error('❌ Remove from cart failed:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await cartAPI.clearCart();
      }
      setCartItems([]);
      localStorage.removeItem("guestCart");
    } catch (error) {
      console.error('❌ Clear cart failed:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Prefer explicit item.price (guest cart), else product.price (populated on user cart), else item.productPrice
      let price = item?.price ?? item?.product?.price ?? item?.productPrice ?? 0;

      // If price is a string, strip non-numeric chars like currency symbols or commas
      if (typeof price === 'string') {
        price = price.replace(/[^0-9.-]+/g, '');
      }

      price = Number(price) || 0;
      const qty = Number(item?.quantity || item?.qty) || 0;
      return total + price * qty;
    }, 0);
  };

  const getCartItemsCount = () =>
    cartItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  const syncGuestCart = async () => {
    if (user && cartItems.length > 0) {
      try {
        console.log('🔄 Syncing guest cart to user account...');
        for (const item of cartItems) {
          await cartAPI.addToCart({
            productId: item.product,
            size: item.size,
            quantity: item.quantity
          });
        }
        await loadUserCart();
        localStorage.removeItem('guestCart');
        console.log('✅ Guest cart synced successfully');
      } catch (error) {
        console.error('❌ Guest cart sync failed:', error);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        loading,
        syncGuestCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};