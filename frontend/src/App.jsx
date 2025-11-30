import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import { testConnection } from './services/api';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  const [apiDown, setApiDown] = useState(false);
  useEffect(() => {
    console.log('🔍 App.jsx rendered');
    console.log('🌐 API URL:', import.meta.env.VITE_API_URL);
    console.log('🔑 Token exists (session):', !!sessionStorage.getItem('token'));
    console.log('👤 User exists (session):', !!sessionStorage.getItem('user'));
    // Health check
    (async () => {
      try {
        await testConnection();
        setApiDown(false);
        console.log('✅ Backend health check OK');
      } catch (err) {
        console.warn('⚠️ Backend health check failed', err);
        setApiDown(true);
      }
    })();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="App">
              {apiDown && (
                <div style={{ background: '#ffe6e6', color: '#8a0000', padding: '8px', textAlign: 'center' }}>
                  Backend API unreachable — verify VITE_API_URL and backend health.
                </div>
              )}
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order/:id" element={<OrderSuccess />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;