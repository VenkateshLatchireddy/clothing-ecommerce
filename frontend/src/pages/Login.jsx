import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const authContainerStyle = {
  maxWidth: '400px',
  margin: '50px auto',
  padding: '40px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const { syncGuestCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Submitting login for', formData.email);
      const result = await login(formData.email, formData.password);
      if (result.success) {
        await syncGuestCart();
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Login request failed:', error);
      const serverMsg = error?.response?.data?.message || error?.message || 'An error occurred during login';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Login to Your Account
      </h2>

      {error && (
        <div style={{
          padding: '15px',
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ 
        textAlign: 'center', 
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
<p style={{ 
  textAlign: 'center', 
  fontSize: '16px',
  fontWeight: '500',
  padding: '10px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '8px',
  color: 'white'
}}>
  Don't have an account?{' '}
  <Link 
    to="/register" 
    style={{ 
      color: '#ffeb3b',
      textDecoration: 'underline',
      fontWeight: 'bold',
      fontSize: '16px'
    }}
  >
    Register here
  </Link>
</p>
      </div>
    </div>
  );
};

export default Login;