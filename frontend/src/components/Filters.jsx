import React, { useState } from 'react';

const filtersStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '20px'
};

const filterGroupStyle = {
  marginBottom: '15px'
};

const priceRangeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const Filters = ({ onFilter, loading }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    size: '',
    minPrice: '',
    maxPrice: ''
  });

  const categories = ['All', 'Men', 'Women', 'Kids', 'Unisex'];
  const sizes = ['', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
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
    onFilter(clearedFilters);
  };

  return (
    <div style={filtersStyle}>
      <h3 style={{ 
        marginBottom: '20px', 
        color: '#333',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
      }}>
        Filters
      </h3>
      
      <div style={filterGroupStyle}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
          Search
        </label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search products..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={filterGroupStyle}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
          Category
        </label>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat === 'All' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={filterGroupStyle}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
          Size
        </label>
        <select
          name="size"
          value={filters.size}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">All Sizes</option>
          {sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div style={filterGroupStyle}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
          Price Range
        </label>
        <div style={priceRangeStyle}>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
          <span style={{ color: '#666', fontWeight: '500' }}>to</span>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      <button 
        onClick={clearFilters} 
        style={{
          padding: '10px 20px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
        disabled={loading}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default Filters;