import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from '../context/ToastContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // No local popup; controlled by ToastContext

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProduct(id);
      setProduct(response.data.product);
      if (response.data.product.sizes.length > 0) {
        setSelectedSize(response.data.product.sizes[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      // Show error message via toast
      showToast("Please select a size", 'error');
      return;
    }

    if (!user) {
      showToast("Please login to add items to cart", 'error');
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product, selectedSize, quantity);
      showToast("Product added to cart!", 'success');
    } catch (error) {
      showToast("Failed to add to cart", 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>Product not found</div>
    );
  }

  return (
    <div className="product-page" style={styles.page}>
      {/* Global toast used via ToastContext, no local popup here */}

      <div className="product-grid" style={styles.grid}>
        
        {/* IMAGE SECTION */}
        <div className="image-container" style={styles.imageContainer}>
          <img
            src={product.image}
            alt={product.name}
            style={styles.image}
          />
        </div>

        {/* DETAILS SECTION */}
        <div className="details-section" style={styles.detailsSection}>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.category}>{product.category}</p>

          <p style={styles.price}>₹ {product.price}</p>

          <p style={styles.description}>{product.description}</p>

          {/* SIZE SELECTION */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={styles.sectionTitle}>Select Size</h3>
            <div className="sizes" style={styles.sizeList}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    ...styles.sizeButton,
                    background:
                      selectedSize === size ? "#007bff" : "white",
                    color: selectedSize === size ? "white" : "#333",
                    border:
                      selectedSize === size
                        ? "2px solid #007bff"
                        : "1px solid #ddd",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={styles.sectionTitle}>Quantity</h3>
            <div style={styles.quantityBox}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyButton}
              >
                -
              </button>
              <span style={styles.qtyValue}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={styles.qtyButton}
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            style={{
              ...styles.addButton,
              background: addingToCart ? "#6c757d" : "#007bff",
              cursor: addingToCart ? "not-allowed" : "pointer",
            }}
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>
        {`
          @media(max-width: 900px) {
            .product-grid {
              grid-template-columns: 1fr !important;
              padding: 20px !important;
            }
            .image-container img {
              height: 350px !important;
            }
          }

          @media(max-width: 600px) {
            .product-page {
              padding: 20px 12px !important;
            }

            .image-container img {
              height: 280px !important;
            }

            .details-section h1 {
              font-size: 1.6rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProductDetail;

const styles = {
  page: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    position: "relative",
  },

  // (Moved popup to ToastContext)

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "50px",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },

  imageContainer: {
    width: "100%",
  },

  image: {
    width: "100%",
    height: "500px",
    objectFit: "cover",
    borderRadius: "12px",
  },

  detailsSection: {
    display: "flex",
    flexDirection: "column",
  },

  title: {
    fontSize: "2.2rem",
    marginBottom: 10,
    color: "#333",
  },

  category: {
    color: "#777",
    marginBottom: 15,
    textTransform: "capitalize",
  },

  price: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 20,
  },

  description: {
    marginBottom: 30,
    lineHeight: 1.6,
    color: "#555",
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
  },

  sizeList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  sizeButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
  },

  quantityBox: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },

  qtyButton: {
    padding: "10px 15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },

  qtyValue: {
    fontSize: "1.2rem",
    fontWeight: "600",
    minWidth: "35px",
    textAlign: "center",
  },

  addButton: {
    width: "100%",
    padding: "15px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginTop: 10,
  },
};

