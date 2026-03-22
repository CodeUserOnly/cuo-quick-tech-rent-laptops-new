import React, { useState, useEffect } from 'react';
import DeviceCard from '../components/DeviceCard';
import FilterSection from '../components/FilterSection';

const BrowseDevices = ({ devices, addToCart }) => {
  const [filteredDevices, setFilteredDevices] = useState(devices);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 2000,
    brand: '',
    location: '',
    ram: '',
    storage: '',
    availableOnly: false
  });
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Extract unique values for filters from actual devices
  const brands = [...new Set(devices.map(device => device.brand))];
  const locations = [...new Set(devices.map(device => device.location))];
  const ramOptions = [...new Set(devices.map(device => device.specs?.ram).filter(Boolean))];
  const storageOptions = [...new Set(devices.map(device => device.specs?.storage).filter(Boolean))];

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    let result = devices;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(device => 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.specs?.processor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price
    result = result.filter(device => 
      device.price >= filters.minPrice && device.price <= filters.maxPrice
    );

    // Filter by brand
    if (filters.brand) {
      result = result.filter(device => 
        device.brand.toLowerCase() === filters.brand.toLowerCase()
      );
    }

    // Filter by location
    if (filters.location) {
      result = result.filter(device => 
        device.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by RAM
    if (filters.ram) {
      result = result.filter(device => 
        device.specs?.ram === filters.ram
      );
    }

    // Filter by storage
    if (filters.storage) {
      result = result.filter(device => 
        device.specs?.storage === filters.storage
      );
    }

    // Filter by availability
    if (filters.availableOnly) {
      result = result.filter(device => device.available);
    }

    // Sort devices
    result = sortDevices(result, sortBy);

    setFilteredDevices(result);
  }, [devices, filters, sortBy, searchTerm]);

  const sortDevices = (devicesList, sortType) => {
    const sorted = [...devicesList];
    
    switch (sortType) {
      case 'price-low-high':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'featured':
      default:
        return sorted.sort((a, b) => {
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          return a.name.localeCompare(b.name);
        });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 2000,
      brand: '',
      location: '',
      ram: '',
      storage: '',
      availableOnly: false
    });
    setSearchTerm('');
    setSortBy('featured');
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`browse-container ${animateIn ? 'fade-in' : ''}`}>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          .browse-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            padding: 2rem 1rem;
          }

          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }

          .slide-in-left {
            animation: slideInLeft 0.5s ease-out;
          }

          .slide-in-up {
            animation: slideInUp 0.5s ease-out;
          }

          /* Search Bar Styles */
          .search-wrapper {
            position: relative;
            flex: 1;
          }

          .search-input {
            width: 100%;
            padding: 12px 48px 12px 48px;
            border: 2px solid #e0e0e0;
            border-radius: 50px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
          }

          .search-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          }

          .search-icon {
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            pointer-events: none;
          }

          .clear-search {
            position: absolute;
            right: 18px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            transition: all 0.2s ease;
          }

          .clear-search:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
          }

          /* Sort Select Styles */
          .sort-select {
            padding: 12px 32px 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
          }

          .sort-select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          }

          /* Filter Button Styles */
          .filter-btn {
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            border: 2px solid #e0e0e0;
            color: #6c757d;
          }

          .filter-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent;
            color: white;
          }

          .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          }

          /* Results Header Styles */
          .results-header {
            background: white;
            border-radius: 16px;
            padding: 16px 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .results-count {
            font-weight: 600;
            color: #667eea;
          }

          .clear-filters-btn {
            background: none;
            border: none;
            color: #dc3545;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 20px;
            transition: all 0.2s ease;
          }

          .clear-filters-btn:hover {
            background: rgba(220, 53, 69, 0.1);
            transform: scale(1.05);
          }

          /* Empty State Styles */
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .empty-icon {
            font-size: 80px;
            color: #dee2e6;
            margin-bottom: 20px;
          }

          /* Device Grid - FIXED: Show 3 devices per row */
          .devices-grid {
            display: grid;
            gap: 24px;
          }

          /* When filters are visible - 2 columns in grid (for better spacing) */
          .devices-grid.with-filters {
            grid-template-columns: repeat(2, 1fr);
          }

          /* When filters are hidden - 3 columns in grid */
          .devices-grid.without-filters {
            grid-template-columns: repeat(3, 1fr);
          }

          .device-card-wrapper {
            animation: slideInUp 0.5s ease-out;
            animation-fill-mode: both;
          }

          /* Tablet View - 2 columns */
          @media (max-width: 992px) {
            .devices-grid.with-filters,
            .devices-grid.without-filters {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          /* Mobile View - 1 column */
          @media (max-width: 768px) {
            .browse-container {
              padding: 1rem;
            }

            .search-input {
              font-size: 14px;
              padding: 10px 40px 10px 40px;
            }

            .filter-btn, .sort-select {
              padding: 8px 16px;
              font-size: 13px;
            }

            .results-header {
              flex-direction: column;
              gap: 12px;
              align-items: stretch !important;
            }

            .devices-grid.with-filters,
            .devices-grid.without-filters {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .empty-state {
              padding: 40px 16px;
            }

            .empty-icon {
              font-size: 60px;
            }
          }

          @media (max-width: 576px) {
            .search-controls {
              flex-direction: column;
              gap: 12px;
            }

            .filter-btn, .sort-select {
              width: 100%;
              justify-content: center;
            }

            .results-header {
              padding: 12px 16px;
            }
          }

          /* Loading Skeleton */
          .skeleton-card {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 16px;
            height: 320px;
          }

          /* Active Filters Tags */
          .filter-tag {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .filter-tag button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            opacity: 0.8;
            transition: opacity 0.2s;
          }

          .filter-tag button:hover {
            opacity: 1;
          }

          /* Ensure DeviceCard takes full width in grid */
          .device-card-wrapper > * {
            height: 100%;
          }
        `}
      </style>

      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5 slide-in-up">
          <h1 style={{ 
            fontSize: "clamp(2rem, 5vw, 2.5rem)",
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem"
          }}>
            Browse Laptops
          </h1>
          <p className="text-muted" style={{ fontSize: "clamp(0.9rem, 3vw, 1.1rem)" }}>
            Find the perfect laptop for your needs
          </p>
        </div>

        {/* Search and Controls Bar */}
        <div className="row mb-4 slide-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="col-12">
            <div className="search-controls d-flex gap-3 flex-wrap">
              <div className="search-wrapper flex-grow-1">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search laptops by name, brand, or processor..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button 
                className={`filter-btn ${showFilters ? 'active' : ''}`}
                onClick={toggleFilters}
              >
                <i className="fas fa-sliders-h"></i>
                <span>Filters</span>
                {Object.values(filters).some(v => v && v !== 0 && v !== '') && (
                  <span className="badge bg-danger ms-1" style={{ fontSize: "10px" }}>
                    !
                  </span>
                )}
              </button>
              <select 
                className="sort-select" 
                value={sortBy} 
                onChange={handleSortChange}
              >
                <option value="featured">✨ Featured</option>
                <option value="price-low-high">💰 Price: Low to High</option>
                <option value="price-high-low">💰 Price: High to Low</option>
                <option value="name-a-z">📝 Name: A to Z</option>
                <option value="name-z-a">📝 Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Filters Sidebar - Conditionally rendered */}
          {showFilters && (
            <div className="col-lg-3 col-md-4 mb-4 slide-in-left" style={{ animationDelay: "0.1s" }}>
              <FilterSection 
                filters={filters} 
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                brands={brands}
                locations={locations}
                ramOptions={ramOptions}
                storageOptions={storageOptions}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Devices Grid */}
          <div className={showFilters ? "col-lg-9 col-md-8" : "col-12"}>
            {/* Results Header */}
            <div className="results-header d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="results-count">
                  <i className="fas fa-laptop me-2"></i>
                  {filteredDevices.length} of {devices.length} laptops
                </span>
                {filters.availableOnly && (
                  <span className="filter-tag">
                    <i className="fas fa-check-circle"></i>
                    Available Only
                  </span>
                )}
                {searchTerm && (
                  <span className="filter-tag">
                    <i className="fas fa-search"></i>
                    "{searchTerm}"
                  </span>
                )}
              </div>
              {(filters.brand || filters.location || filters.ram || filters.storage || filters.availableOnly || searchTerm) && (
                <button 
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  <i className="fas fa-trash-alt me-1"></i>
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Device Grid - Now shows 3 devices per row when filters are hidden */}
            {filteredDevices.length > 0 ? (
              <div className={`devices-grid ${showFilters ? 'with-filters' : 'without-filters'}`}>
                {filteredDevices.map((device, index) => (
                  <div 
                    key={device.id} 
                    className="device-card-wrapper"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <DeviceCard device={device} addToCart={addToCart} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state slide-in-up">
                <div className="empty-icon">
                  <i className="fas fa-laptop-code"></i>
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "12px" }}>No laptops found</h4>
                <p className="text-muted mb-4">
                  {searchTerm 
                    ? `No results found for "${searchTerm}"`
                    : 'Try adjusting your filters to find what you\'re looking for'
                  }
                </p>
                <button 
                  className="btn btn-gradient-primary px-4 py-2"
                  onClick={clearFilters}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "50px",
                    color: "white",
                    fontWeight: 600,
                    transition: "all 0.3s ease"
                  }}
                >
                  <i className="fas fa-redo-alt me-2"></i>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add global button styles */}
      <style>
        {`
          .btn-gradient-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            transition: all 0.3s ease;
          }
          
          .btn-gradient-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
          
          .btn-gradient-primary:active {
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
};

export default BrowseDevices;