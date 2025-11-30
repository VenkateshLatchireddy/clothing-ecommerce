import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    closeMenu();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle("menu-open", !isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove("menu-open");
  };

  return (
    <nav
      style={{
        background: "#333",
        color: "white",
        padding: "1rem 0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
          onClick={closeMenu}
        >
          Sky Clothing Store
        </Link>

        {/* DESKTOP NAV */}
        <div className="desktop-nav" style={{ display: "none", gap: "2rem", alignItems: "center" }}>
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/products">Products</Link>

          {/* Desktop Cart */}
          <Link className="nav-link cart-link" to="/cart" style={{ position: "relative" }}>
            Cart
            {getCartItemsCount() > 0 && (
              <span
                style={{
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "12px",
                  position: "absolute",
                  top: "-5px",
                  right: "-10px",
                  fontWeight: "bold",
                  minWidth: "18px",
                  textAlign: "center",
                }}
              >
                {getCartItemsCount()}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span style={{ color: "#ccc" }}>Hello, {user.name}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link
                to="/login"
                style={{
                  background: "#6c757d",
                  padding: "8px 16px",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "5px",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: "#007bff",
                  padding: "8px 16px",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "5px",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE RIGHT SECTION */}
        <div className="mobile-right-section" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Cart Icon */}
          <Link to="/cart" style={{ color: "white", fontSize: "1.4rem", position: "relative" }}>
            🛒
            {getCartItemsCount() > 0 && (
              <span
                style={{
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 5px",
                  fontSize: "10px",
                  position: "absolute",
                  top: "-5px",
                  right: "-10px",
                }}
              >
                {getCartItemsCount()}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={toggleMenu}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.7rem",
              cursor: "pointer",
            }}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      <div
        className="mobile-nav"
        style={{
          display: isMenuOpen ? "flex" : "none",
          flexDirection: "column",
          background: "#333",
          padding: "1rem 20px",
          gap: "1rem",
        }}
      >
        <Link className="mobile-link" to="/" onClick={closeMenu}>Home</Link>
        <Link className="mobile-link" to="/products" onClick={closeMenu}>Products</Link>

        {user ? (
          <>
            <span style={{ color: "#ccc", textAlign: "center" }}>Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                background: "#6c757d",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                color: "white",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={closeMenu}
              style={{
                background: "#6c757d",
                padding: "10px",
                textDecoration: "none",
                borderRadius: "5px",
                color: "white",
                textAlign: "center",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={closeMenu}
              style={{
                background: "#007bff",
                padding: "10px",
                textDecoration: "none",
                borderRadius: "5px",
                color: "white",
                textAlign: "center",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
      
      <style>
        {`
          /* Remove purple visited color + underline */
          a, a:visited, a:active {
            color: white !important;
            text-decoration: none !important;
          }

          /* Hover styling */
          .nav-link:hover,
          .mobile-link:hover {
            background: #555;
            border-radius: 5px;
            color: white !important;
          }

          /* Desktop links default hidden */
          .desktop-nav { display: none; }
          .mobile-right-section { display: flex; }

          /* Desktop View */
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .mobile-right-section { display: none !important; }
            .mobile-nav { display: none !important; }
          }

          body.menu-open {
            overflow: hidden;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
