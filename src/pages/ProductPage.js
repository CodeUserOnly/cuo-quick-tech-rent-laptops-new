import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const ProductPage = ({ devices, addToCart, isLoading = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rentalDuration, setRentalDuration] = useState(7);
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setError(null);
    setDevice(null);
    setImageLoaded(false);

    if (!id) {
      setError('Invalid device ID');
      return;
    }

    if (devices && devices.length > 0) {
      const foundDevice = devices.find(d => 
        d.id === id || 
        d.id === parseInt(id) || 
        String(d.id) === String(id)
      );

      if (foundDevice) {
        setDevice(foundDevice);
      } else {
        setError(`Device with ID "${id}" not found`);
      }
    }
  }, [id, devices]);

  const handleAddToCart = () => {
    if (!device || !device.available) return;
    
    const deviceWithDuration = { 
      ...device, 
      rentalDuration,
      totalPrice: device.price * rentalDuration
    };
    addToCart(deviceWithDuration);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRentalDurationChange = (value) => {
    const days = parseInt(value) || 1;
    if (days >= 1 && days <= 30) {
      setRentalDuration(days);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/600x400/6c757d/ffffff?text=No+Image+Available';
    setImageLoaded(true);
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{width: '2.5rem', height: '2.5rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card border-warning">
              <div className="card-body py-4">
                <i className="fas fa-exclamation-triangle text-warning mb-3" style={{fontSize: '2.5rem'}}></i>
                <h4 className="text-warning mb-2">Device Not Found</h4>
                <p className="text-muted mb-3">{error || 'The device you are looking for does not exist.'}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-outline-primary"
                  >
                    <i className="fas fa-arrow-left me-2"></i>Go Back
                  </button>
                  <Link to="/browse" className="btn btn-primary">
                    Browse All Devices
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center py-3" role="alert">
          <i className="fas fa-check-circle me-2 fs-5"></i>
          <div>
            <strong>Success!</strong> {device.name} has been added to your cart.
          </div>
          <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
        </div>
      )}

      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              <i className="fas fa-home me-1"></i>Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/browse" className="text-decoration-none">Browse Laptops</Link>
          </li>
          <li className="breadcrumb-item active text-primary" aria-current="page">
            {device.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="product-image-container position-relative">
            {!imageLoaded && (
              <div className="placeholder-glow">
                <div className="placeholder rounded" style={{height: '400px', width: '100%'}}></div>
              </div>
            )}
            <img 
              src={device.image} 
              alt={device.name} 
              className={`img-fluid rounded shadow-sm ${imageLoaded ? 'fade-in' : 'd-none'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            <div className="position-absolute top-0 end-0 m-3">
              <span className={`badge ${device.available ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                <i className={`fas ${device.available ? 'fa-check' : 'fa-times'} me-1`}></i>
                {device.available ? 'Available' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="product-details">
            <div className="mb-4">
              <h1 className="h3 fw-bold text-dark mb-2">{device.name}</h1>
              <div className="d-flex align-items-center gap-3 mb-2">
                <span className="badge bg-primary">{device.brand}</span>
                <span className="text-muted">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {device.location}
                </span>
              </div>
            </div>

            <div className="price-section mb-4 p-4 bg-light rounded">
              <div className="d-flex align-items-baseline">
                <span className="h2 fw-bold text-primary">₹{device.price}</span>
                <span className="fs-5 text-muted ms-2">/ day</span>
              </div>
              <p className="text-muted mb-0">Free delivery • No hidden charges</p>
            </div>

            <div className="specs-section mb-4">
              <h4 className="fw-semibold mb-3">
                <i className="fas fa-microchip text-primary me-2"></i>
                Specifications
              </h4>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-microchip text-primary me-2"></i>
                        <strong>Processor</strong>
                      </div>
                      <p className="mb-0 text-dark">{device.specs.processor}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-memory text-primary me-2"></i>
                        <strong>RAM</strong>
                      </div>
                      <p className="mb-0 text-dark">{device.specs.ram}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-hdd text-primary me-2"></i>
                        <strong>Storage</strong>
                      </div>
                      <p className="mb-0 text-dark">{device.specs.storage}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-desktop text-primary me-2"></i>
                        <strong>Display</strong>
                      </div>
                      <p className="mb-0 text-dark">{device.specs.display}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {device.available ? (
              <div className="rental-section">
                <h4 className="fw-semibold mb-3">
                  <i className="fas fa-calendar-alt text-primary me-2"></i>
                  Rental Options
                </h4>
                
                <div className="card border-0 bg-light mb-4">
                  <div className="card-body">
                    <label className="form-label fw-medium mb-2">
                      Rental Duration: <span className="text-primary">{rentalDuration} days</span>
                    </label>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="1" 
                      max="30" 
                      value={rentalDuration}
                      onChange={(e) => handleRentalDurationChange(e.target.value)}
                    />
                    <div className="d-flex justify-content-between text-muted">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-primary text-white mb-4 border-0">
                  <div className="card-body text-center py-3">
                    <h5 className="card-title mb-2">Total Rental Cost</h5>
                    <div className="h3 fw-bold mb-1">₹{device.price * rentalDuration}</div>
                    <p className="mb-0 opacity-75">
                      ₹{device.price} × {rentalDuration} days
                    </p>
                  </div>
                </div>

                <div className="d-grid gap-3">
                  <button 
                    className="btn btn-primary btn-lg py-3 fw-semibold"
                    onClick={handleAddToCart}
                  >
                    <i className="fas fa-cart-plus me-2"></i>
                    Add to Cart - ₹{device.price * rentalDuration}
                  </button>
                  <Link to="/browse" className="btn btn-outline-primary py-3">
                    <i className="fas fa-laptop me-2"></i>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning border-0">
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle fa-lg me-3"></i>
                  <div>
                    <h5 className="alert-heading mb-1">Currently Unavailable</h5>
                    <p className="mb-0">This laptop is not available for rental at the moment. Please check back later or explore other options.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-header bg-transparent border-0 py-3">
              <h4 className="fw-semibold mb-0">
                <i className="fas fa-info-circle text-primary me-2"></i>
                Product Description
              </h4>
            </div>
            <div className="card-body">
              <p className="card-text mb-3">
                The <strong className="text-primary">{device.name}</strong> from {device.brand} is a {device.specs.ram.includes('16') ? 'high-performance' : 'reliable'} laptop perfect for {device.specs.ram.includes('16') ? 'demanding tasks, gaming, and professional work' : 'everyday computing, studies, and business tasks'}. 
                With its <strong>{device.specs.processor}</strong> processor and <strong>{device.specs.ram}</strong> of RAM, it handles multitasking with ease. 
                The <strong>{device.specs.storage}</strong> storage provides ample space for your files, applications, and projects.
              </p>
              <p className="card-text mb-0">
                Featuring a <strong>{device.specs.display}</strong> display{device.specs.graphics && <span> and <strong>{device.specs.graphics}</strong> graphics</span>}, 
                this laptop delivers {device.specs.display.includes('4K') ? 'stunning visual quality' : 'crisp and clear visuals'} for all your needs. 
                Whether you're working on complex projects, creative endeavors, or everyday computing tasks, 
                this laptop offers reliable performance in a portable package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;