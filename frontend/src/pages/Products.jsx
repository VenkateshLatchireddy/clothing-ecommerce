import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    size: '',
    minPrice: '',
    maxPrice: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    hasMore: false
  });
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const categories = ['All', 'Men', 'Women', 'Kids', 'Unisex'];
  const sizes = ['All', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async (page = pagination.page) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        category: filters.category === 'All' ? '' : filters.category,
        size: filters.size === 'All' ? '' : filters.size,
        page,
        limit: 12
      };
      
      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
        hasMore: response.data.hasMore
      });

      // Initialize selected sizes and quantities
      const initialSizes = {};
      const initialQuantities = {};
      response.data.products.forEach(product => {
        initialSizes[product._id] = '';
        initialQuantities[product._id] = 1;
      });
      setSelectedSizes(initialSizes);
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      size: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleAddToCart = async (product) => {
    const productId = product._id;
    const size = selectedSizes[productId];
    const quantity = quantities[productId];

    if (!size) {
      showToast('Please select a size', 'error');
      return;
    }

    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      await addToCart(product, size, quantity);
      showToast('Product added to cart successfully!', 'success');
      // Reset quantity after adding to cart
      setQuantities(prev => ({
        ...prev,
        [productId]: 1
      }));
    } catch (error) {
      showToast('Failed to add product to cart', 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;

    // Previous Button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '10px 15px',
          background: currentPage === 1 ? '#f8f9fa' : '#007bff',
          color: currentPage === 1 ? '#6c757d' : 'white',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          margin: '0 2px'
        }}
      >
        ← Previous
      </button>
    );

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            style={{
              padding: '10px 15px',
              background: i === currentPage ? '#007bff' : 'white',
              color: i === currentPage ? 'white' : '#007bff',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              margin: '0 2px',
              fontWeight: i === currentPage ? 'bold' : 'normal'
            }}
          >
            {i}
          </button>
        );
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        buttons.push(
          <span key={`ellipsis-${i}`} style={{ padding: '10px 5px', color: '#6c757d' }}>
            ...
          </span>
        );
      }
    }

    // Next Button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '10px 15px',
          background: currentPage === totalPages ? '#f8f9fa' : '#007bff',
          color: currentPage === totalPages ? '#6c757d' : 'white',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          margin: '0 2px'
        }}
      >
        Next →
      </button>
    );

    return buttons;
  };

  const ProductCard = ({ product }) => {
    const productId = product._id;
    const selectedSize = selectedSizes[productId] || '';
    const quantity = quantities[productId] || 1;
    const isAdding = addingToCart[productId] || false;

    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      }}
      >
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
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
          <div style={{ padding: '20px' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#333',
              lineHeight: '1.4'
            }}>
              {product.name}
            </h3>
            <p style={{ 
              color: '#666', 
              fontSize: '0.9rem', 
              marginBottom: '8px',
              textTransform: 'capitalize'
            }}>
              {product.category}
            </p>
            <p style={{ 
              fontSize: '1.3rem', 
              fontWeight: '700', 
              color: '#007bff',
              marginBottom: '12px'
            }}>
              ₹ {product.price}
            </p>
          </div>
        </Link>

        {/* Add to Cart Section */}
        <div style={{ 
          padding: '0 20px 20px 20px',
          marginTop: 'auto'
        }}>
          {/* Size Selection */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#555'
            }}>
              Select Size:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(productId, size)}
                  style={{
                    padding: '8px 12px',
                    border: selectedSize === size ? '2px solid #007bff' : '1px solid #ddd',
                    background: selectedSize === size ? '#007bff' : 'white',
                    color: selectedSize === size ? 'white' : '#333',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#555'
            }}>
              Quantity:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleQuantityChange(productId, quantity - 1)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                minWidth: '30px', 
                textAlign: 'center',
                color: '#333'
              }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(productId, quantity + 1)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={() => handleAddToCart(product)}
            disabled={isAdding || !selectedSize}
            style={{
              width: '100%',
              padding: '12px',
              background: isAdding ? '#6c757d' : (!selectedSize ? '#ccc' : '#28a745'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (isAdding || !selectedSize) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!isAdding && selectedSize) {
                e.target.style.background = '#218838';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAdding && selectedSize) {
                e.target.style.background = '#28a745';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isAdding ? 'Adding to Cart...' : (!selectedSize ? 'Select Size' : `Add to Cart (${quantity})`)}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Page Header */}
      <div style={{ 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          marginBottom: '10px', 
          color: '#333',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          Our Collection
        </h1>
        <p style={{ 
          color: '#666',
          fontSize: '1.1rem'
        }}>
          Showing page {pagination.page} of {pagination.pages} • {pagination.total} products total
        </p>
      </div>

      {/* Horizontal Filters Section */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* Search Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {/* Category Filter */}
            <div style={{ minWidth: '120px' }}>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div style={{ minWidth: '100px' }}>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min ₹"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                style={{
                  width: '80px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#666' }}>to</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                style={{
                  width: '80px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <main>
        {loading && products.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            fontSize: '1.2rem',
            color: '#666'
          }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <div>Loading products...</div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '25px',
              marginBottom: '40px'
            }}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* No Products Found */}
            {products.length === 0 && !loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px', 
                color: '#666',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '20px'
                }}>
                  🔍
                </div>
                <h3 style={{ 
                  marginBottom: '15px',
                  fontSize: '1.5rem'
                }}>
                  No products found
                </h3>
                <p style={{ 
                  fontSize: '1.1rem',
                  opacity: 0.8
                }}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '40px',
                padding: '20px'
              }}>
                {renderPaginationButtons()}
              </div>
            )}
          </>
        )}
      </main>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Products;