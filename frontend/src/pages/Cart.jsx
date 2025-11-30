import React from "react";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cartItems, updateCartItem, removeFromCart, getCartTotal, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) return navigate("/login");
    navigate("/checkout");
  };

  if (!cartItems.length) {
    return (
      <div
        style={{
          maxWidth: 1000,
          margin: " auto",
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Your Cart is Empty</h2>
        <Link
          to="/products"
          style={{
            padding: "12px 30px",
            background: "#007bff",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2>Shopping Cart ({cartItems.length})</h2>
        <button
          onClick={clearCart}
          style={{
            background: "#dc3545",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Clear Cart
        </button>
      </div>

      {/* ITEMS */}
      {cartItems.map((item) => (
        <CartItem
          key={`${item.product}-${item.size}`}
          item={item}
          onUpdate={updateCartItem}
          onRemove={removeFromCart}
        />
      ))}

      {/* SUMMARY */}
      <div
        style={{
          marginTop: 20,
          background: "white",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}
        >
          <h3>Total:</h3>
          <h3 style={{ color: "#007bff" }}>₹ {getCartTotal().toFixed(2)}</h3>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/products"
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "#6c757d",
              color: "white",
              textAlign: "center",
              borderRadius: 6,
            }}
          >
            Continue Shopping
          </Link>

          <button
            onClick={handleCheckout}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
