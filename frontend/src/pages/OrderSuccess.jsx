import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersAPI } from "../services/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.page}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div style={styles.page}>
        <h2>Order not found</h2>
        <Link to="/" style={styles.primaryButton}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.page} className="order-success-page">
      <div style={styles.card} className="order-card">

        {/* Success Banner */}
        <div style={styles.successBanner}>
          <h1 style={{ margin: "0 0 10px 0" }}>🎉 Order Confirmed!</h1>
          <p style={{ margin: 0, fontSize: "1.1rem" }}>
            Thank you for your purchase! A confirmation email has been sent.
          </p>
        </div>

        {/* ORDER DETAILS */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={styles.sectionTitle}>Order Details</h2>

          <div className="details-grid" style={styles.detailsGrid}>
            <div><strong>Order ID:</strong> {order._id}</div>
            <div><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</div>
            <div><strong>Status:</strong> {order.status}</div>
            <div><strong>Total:</strong> ₹ {order.totalPrice.toFixed(2)}</div>
          </div>

          {/* SHIPPING ADDRESS */}
          {order.shippingAddress && (
            <div style={{ marginTop: 20 }}>
              <h3 style={styles.subHeading}>Shipping Address</h3>
              <p style={styles.address}>
                {order.shippingAddress.name} <br />
                {order.shippingAddress.address} <br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode} <br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}
        </div>

        {/* ORDER ITEMS */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={styles.subHeading}>Order Items</h3>

          {order.items.map((item, index) => (
            <div key={index} className="item-card" style={styles.itemCard}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "1rem" }}>{item.name}</div>
                <div style={{ color: "#666", marginTop: 4 }}>
                  Size: {item.size} × {item.quantity}
                </div>
              </div>

              <div style={styles.itemPrice}>
                ₹ {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="buttons" style={styles.buttonRow}>
          <Link to="/products" style={styles.primaryButton}>
            Continue Shopping
          </Link>

          <Link to="/orders" style={styles.secondaryButton}>
            View All Orders
          </Link>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .order-card {
              padding: 20px !important;
            }
            .details-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            .item-card {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 8px !important;
            }
            .buttons {
              flex-direction: column !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OrderSuccess;

const styles = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
  },

  card: {
    background: "white",
    padding: "40px",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },

  successBanner: {
    background: "#d4edda",
    color: "#155724",
    padding: "20px",
    borderRadius: 8,
    marginBottom: 30,
    textAlign: "center",
  },

  sectionTitle: {
    marginBottom: 20,
    fontSize: "1.4rem",
    color: "#333",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    background: "#f9f9f9",
    padding: 20,
    borderRadius: 8,
  },

  subHeading: {
    marginBottom: 10,
    fontSize: "1.2rem",
  },

  address: {
    color: "#444",
    lineHeight: 1.6,
  },

  itemCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 8,
    border: "1px solid #eee",
    background: "#fafafa",
    marginBottom: 10,
  },

  itemPrice: {
    fontWeight: "700",
    color: "#007bff",
  },

  buttonRow: {
    display: "flex",
    gap: 15,
    justifyContent: "center",
    marginTop: 20,
  },

  primaryButton: {
    padding: "12px 30px",
    background: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: 8,
    fontWeight: 600,
  },

  secondaryButton: {
    padding: "12px 30px",
    background: "#6c757d",
    color: "white",
    textDecoration: "none",
    borderRadius: 8,
    fontWeight: 600,
  },
};
