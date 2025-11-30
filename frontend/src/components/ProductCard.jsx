import React from 'react';
import { Link } from 'react-router-dom';

const productCardStyle = {
  background: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s, box-shadow 0.3s'
};

const productLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block'
};

const productImageStyle = {
  width: '100%',
  height: '200px',
  overflow: 'hidden'
};

const productInfoStyle = {
  padding: '15px'
};

const ProductCard = ({ product }) => {
  return (
    <div 
      style={productCardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Link to={`/product/${product._id}`} style={productLinkStyle}>
        <div style={productImageStyle}>
          <img 
            src={product.image} 
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
        </div>
        <div style={productInfoStyle}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '5px',
            color: '#333'
          }}>
            {product.name}
          </h3>
          <p style={{ 
            color: '#666', 
            fontSize: '0.9rem', 
            marginBottom: '5px',
            textTransform: 'capitalize'
          }}>
            {product.category}
          </p>
          <p style={{ 
            fontSize: '1.2rem', 
            fontWeight: '700', 
            color: '#007bff',
            marginBottom: '10px'
          }}>
            ₹ {product.price}
          </p>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {product.sizes.map(size => (
              <span 
                key={size} 
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.8rem',
                  color: '#666'
                }}
              >
                {size}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;