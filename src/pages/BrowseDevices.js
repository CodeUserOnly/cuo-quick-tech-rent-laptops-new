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

  // Extract unique values for filters from actual devices
  const brands = [...new Set(devices.map(device => device.brand))];
  const locations = [...new Set(devices.map(device => device.location))];
  const ramOptions = [...new Set(devices.map(device => device.specs?.ram).filter(Boolean))];
  const storageOptions = [...new Set(devices.map(device => device.specs?.storage).filter(Boolean))];

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
        // Featured: Available devices first, then by name
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
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-12">
          <h1 className="mb-2">Browse Laptops</h1>
          <p className="text-muted mb-3">Find the perfect laptop for your needs</p>
        </div>
      </div>

      {/* Search and Controls Bar */}
      <div className="row mb-3">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search laptops..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn btn-outline-primary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex gap-2 justify-content-end">
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={toggleFilters}
            >
              <i className="fas fa-filter me-1"></i>
              Filters
            </button>
            <select 
              className="form-select" 
              value={sortBy} 
              onChange={handleSortChange}
              style={{ width: 'auto' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Filters Sidebar - Conditionally rendered */}
        {showFilters && (
          <div className="col-lg-3 col-md-4 mb-4">
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

        {/* Devices Grid - Adjust columns based on filter visibility */}
        <div className={showFilters ? "col-lg-9 col-md-8" : "col-12"}>
          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="text-muted">
                {filteredDevices.length} of {devices.length} laptops
                {filters.availableOnly && ' • Available'}
                {searchTerm && ` • "${searchTerm}"`}
              </span>
            </div>
            {(filters.brand || filters.location || filters.ram || filters.storage || filters.availableOnly) && (
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Device Grid */}
          {filteredDevices.length > 0 ? (
            <div className={`row ${showFilters ? 'g-3' : 'g-4'}`}>
              {filteredDevices.map(device => (
                <div key={device.id} className={showFilters ? "col-lg-6 col-md-6" : "col-lg-4 col-md-6"}>
                  <DeviceCard device={device} addToCart={addToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="mb-3">
                <i className="fas fa-laptop fa-3x text-muted"></i>
              </div>
              <h4>No laptops found</h4>
              <p className="text-muted mb-3">
                {searchTerm 
                  ? `No results for "${searchTerm}"`
                  : 'Try adjusting your filters'
                }
              </p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseDevices;