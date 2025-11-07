import React from 'react';

const FilterSection = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  brands = [],
  locations = [],
  ramOptions = [],
  storageOptions = [],
  onClose
}) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFilterChange({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">
            <i className="fas fa-filter me-2 text-primary"></i>
            Filters
          </h6>
          <div>
            <button 
              className="btn btn-sm btn-outline-danger me-2"
              onClick={onClearFilters}
            >
              Clear
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body p-3">
        {/* Available Only Filter */}
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="availableOnly"
              name="availableOnly"
              checked={filters.availableOnly}
              onChange={handleInputChange}
            />
            <label className="form-check-label fw-medium" htmlFor="availableOnly">
              Available Only
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-3">
          <label className="form-label fw-medium">Price Range</label>
          <div className="row g-2">
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Min"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Max"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleInputChange}
                min="0"
                max="2000"
              />
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-3">
          <label className="form-label fw-medium">Brand</label>
          <select
            className="form-select form-select-sm"
            name="brand"
            value={filters.brand}
            onChange={handleInputChange}
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="mb-3">
          <label className="form-label fw-medium">Location</label>
          <select
            className="form-select form-select-sm"
            name="location"
            value={filters.location}
            onChange={handleInputChange}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* RAM Filter */}
        <div className="mb-3">
          <label className="form-label fw-medium">RAM</label>
          <select
            className="form-select form-select-sm"
            name="ram"
            value={filters.ram}
            onChange={handleInputChange}
          >
            <option value="">All RAM</option>
            {ramOptions.map(ram => (
              <option key={ram} value={ram}>{ram}</option>
            ))}
          </select>
        </div>

        {/* Storage Filter */}
        <div className="mb-3">
          <label className="form-label fw-medium">Storage</label>
          <select
            className="form-select form-select-sm"
            name="storage"
            value={filters.storage}
            onChange={handleInputChange}
          >
            <option value="">All Storage</option>
            {storageOptions.map(storage => (
              <option key={storage} value={storage}>{storage}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;