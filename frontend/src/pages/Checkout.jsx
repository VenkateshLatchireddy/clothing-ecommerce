import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../services/api";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!user) navigate("/login");
    if (cartItems.length === 0) navigate("/cart");
  }, [user, cartItems, navigate]);

  const onChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const safePrice = (item) => {
    let price = item?.price ?? item?.product?.price ?? item?.productPrice ?? 0;
    if (typeof price === 'string') price = price.replace(/[^0-9.-]+/g, '');
    return Number(price) || 0;
  };

  const safeTotal = (item) =>
    (safePrice(item) * (Number(item.quantity) || 1)).toFixed(2);

  const placeOrder = async () => {
    if (
      !shipping.name ||
      !shipping.address ||
      !shipping.city ||
      !shipping.postalCode ||
      !shipping.country
    ) {
      return setError("Please complete all shipping fields.");
    }

    setLoading(true);
    setError("");

    try {
      const res = await ordersAPI.createOrder({ shippingAddress: shipping });

      if (res.data.success) {
        await clearCart();
        navigate(`/order/${res.data.order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="checkout-page" style={styles.page}>
      <h1 style={styles.title}>Checkout</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div className="checkout-grid" style={styles.grid}>
        {/* LEFT: SHIPPING */}
        <div className="checkout-card" style={styles.card}>
          <h2 style={styles.sectionTitle}>Shipping Address</h2>

          <div style={styles.formGrid}>
            {[
              ["name", "Full Name"],
              ["address", "Street Address"],
              ["city", "City"],
              ["postalCode", "Postal Code"],
              ["country", "Country"],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                name={key}
                placeholder={placeholder}
                value={shipping[key]}
                onChange={onChange}
                style={styles.input}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="checkout-summary" style={styles.summaryCard}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>

          <div style={{ marginBottom: 20 }}>
            {cartItems.map((item) => (
              <div
                key={`${item.product}-${item.size}`}
                style={styles.itemRow}
              >
                <div>
                  <strong>
                    {item.name || item.product?.name || "Product"}
                  </strong>
                  <div style={styles.itemSub}>
                    Size: {item.size} × {item.quantity}
                  </div>
                </div>

                <div style={styles.itemPrice}>₹ {safeTotal(item)}</div>
              </div>
            ))}
          </div>

          <hr style={{ margin: "15px 0" }} />

          <div style={styles.totalRow}>
            <span>Total:</span>
            <span style={styles.totalAmount}>
              ₹ {getCartTotal().toFixed(2)}
            </span>
          </div>

          <button
            style={loading ? styles.buttonDisabled : styles.button}
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>

      {/* INTERNAL RESPONSIVE CSS */}
      <style>
        {`
          /* Desktop / default layout */
          .checkout-grid {
            grid-template-columns: 1fr 380px;
          }
          .checkout-summary {
            position: sticky;
            top: 100px;
          }

          /* Tablet & down */
          @media (max-width: 900px) {
            .checkout-page {
              padding: 30px 16px;
            }

            .checkout-grid {
              grid-template-columns: 1fr;
            }

            .checkout-summary {
              position: static;
              margin-top: 20px;
            }
          }

          /* Small mobile */
          @media (max-width: 600px) {
            .checkout-page {
              padding: 20px 12px;
            }

            .checkout-card,
            .checkout-summary {
              padding: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Checkout;

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  title: {
    marginBottom: 30,
    color: "#333",
  },
  error: {
    background: "#f8d7da",
    color: "#721c24",
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    border: "1px solid #f5c6cb",
  },
  grid: {
    display: "grid",
    gap: 30,
    alignItems: "flex-start",
  },
  card: {
    background: "white",
    padding: 25,
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  summaryCard: {
    background: "white",
    padding: 25,
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    marginBottom: 20,
    color: "#333",
  },
  formGrid: {
    display: "grid",
    gap: 15,
  },
  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: "15px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  itemSub: {
    fontSize: "0.9rem",
    color: "#666",
  },
  itemPrice: {
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "1.3rem",
    fontWeight: "700",
    marginBottom: 20,
  },
  totalAmount: {
    color: "#007bff",
  },
  button: {
    width: "100%",
    padding: 15,
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: "1.1rem",
    cursor: "pointer",
  },
  buttonDisabled: {
    width: "100%",
    padding: 15,
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: "1.1rem",
    cursor: "not-allowed",
  },
};
