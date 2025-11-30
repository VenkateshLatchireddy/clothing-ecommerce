import React from "react";
import { Link } from "react-router-dom";

const CartItem = ({ item, onUpdate, onRemove }) => {
  // SAFE EXTRACTION (fixes NaN)
  const id = item.product?._id || item.product || item._id;
  const name = item.product?.name || item.name || "Product";
  const image =
    item.image ||
    item.product?.image ||
    "https://via.placeholder.com/200x200?text=No+Image";

  let rawPrice = item?.price ?? item?.product?.price ?? item?.productPrice ?? 0;
  if (typeof rawPrice === 'string') {
    rawPrice = rawPrice.replace(/[^0-9.-]+/g, '');
  }
  const price = Number(rawPrice) || 0;

  const qty = Number(item.quantity) || 1;
  const size = item.size || "N/A";
  const total = (price * qty).toFixed(2);

  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className="cart-item"
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 20,
        padding: 20,
        background: "white",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 15,
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          width: isMobile ? "100%" : 130,
          height: isMobile ? 200 : 130,
          borderRadius: 8,
          overflow: "hidden",
          background: "#eee",
          flexShrink: 0,
        }}
      >
        <img
          src={image}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* DETAILS */}
      <div style={{ flex: 1 }}>
        <Link
          to={`/product/${id}`}
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            textDecoration: "none",
            color: "#333",
          }}
        >
          {name}
        </Link>

        <p style={{ marginTop: 5, color: "#666" }}>
          <strong>Size:</strong> {size}
        </p>

        <p style={{ color: "#007bff", fontWeight: "700", fontSize: "1.1rem" }}>
          <strong>Price:</strong> ₹ {price.toFixed(2)}
        </p>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 600, marginRight: 10 }}>Quantity:</span>

          <button
            onClick={() => onUpdate(id, size, qty - 1)}
            style={qtyBtn}
          >
            -
          </button>
          <span style={qtyDisplay}>{qty}</span>
          <button
            onClick={() => onUpdate(id, size, qty + 1)}
            style={qtyBtn}
          >
            +
          </button>
        </div>

        <button onClick={() => onRemove(id, size)} style={removeBtn}>
          Remove Item
        </button>
      </div>

      {/* TOTAL */}
      <div
        style={{
          minWidth: isMobile ? "100%" : 100,
          textAlign: isMobile ? "right" : "center",
          alignSelf: "center",
        }}
      >
        <div style={{ fontSize: "1rem", color: "#666" }}>Item Total:</div>
        <div style={{ fontSize: "1.4rem", color: "#007bff", fontWeight: 700 }}>
          ₹ {total}
        </div>
      </div>
    </div>
  );
};

// Styles
const qtyBtn = {
  width: 30,
  height: 30,
  border: "1px solid #ccc",
  background: "white",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "700",
};

const qtyDisplay = {
  minWidth: 35,
  textAlign: "center",
  fontWeight: "700",
};

const removeBtn = {
  marginTop: 10,
  padding: "8px 16px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};

export default CartItem;
