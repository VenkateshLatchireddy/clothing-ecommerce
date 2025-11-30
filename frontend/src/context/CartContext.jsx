import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartAPI } from "../services/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Load cart depending on login state
  useEffect(() => {
    if (user) loadUserCart();
    else loadGuestCart();
  }, [user]);

  const loadUserCart = async () => {
    try {
      const res = await cartAPI.getCart();
      setCartItems(res.data.cart || []);
    } catch (e) {
      console.error("Load user cart failed", e);
      setCartItems([]);
    }
  };

  const loadGuestCart = () => {
    try {
      const data = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(data);
    } catch {
      setCartItems([]);
    }
  };

  const saveGuestCart = (items) =>
    localStorage.setItem("guestCart", JSON.stringify(items));


  const addToCart = async (product, size, quantity = 1) => {
    if (user) {
      await cartAPI.addToCart({ productId: product._id, size, quantity });
      loadUserCart();
      return;
    }

    // guest user
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
  };

  const updateCartItem = async (productId, size, quantity) => {
    if (user) {
      await cartAPI.updateCart({ productId, size, quantity });
      loadUserCart();
      return;
    }

    let updated = cartItems
      .map((i) =>
        i.product === productId && i.size === size ? { ...i, quantity } : i
      )
      .filter((i) => i.quantity > 0);

    setCartItems(updated);
    saveGuestCart(updated);
  };

  const removeFromCart = async (productId, size) => {
    if (user) {
      await cartAPI.removeFromCart({ productId, size });
      loadUserCart();
      return;
    }

    let updated = cartItems.filter(
      (i) => !(i.product === productId && i.size === size)
    );
    setCartItems(updated);
    saveGuestCart(updated);
  };

  const clearCart = async () => {
    if (user) {
      await cartAPI.clearCart();
      setCartItems([]);
      return;
    }
    setCartItems([]);
    localStorage.removeItem("guestCart");
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price =
        Number(item.price) ||
        Number(item.product?.price) ||
        Number(item.productPrice) ||
        0;

      const qty = Number(item.quantity) || 0;

      return total + price * qty;
    }, 0);
  };

  const getCartItemsCount = () =>
    cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
