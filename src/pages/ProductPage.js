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
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

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
        setSelectedImage(foundDevice.image);
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

  const calculateSavings = () => {
    if (rentalDuration >= 7) {
      const weeklyDiscount = 0.1;
      const originalPrice = device.price * rentalDuration;
      const discountedPrice = originalPrice * (1 - weeklyDiscount);
      return Math.round(originalPrice - discountedPrice);
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="product-loading-container">
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .product-loading-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(102, 126, 234, 0.2);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="error-container">
        <style>{`
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
          .error-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .error-card {
            background: white;
            border-radius: 24px;
            padding: 3rem;
            text-align: center;
            animation: slideInUp 0.5s ease-out;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            max-width: 500px;
            width: 100%;
          }
          @media (max-width: 768px) {
            .error-card {
              padding: 2rem;
            }
          }
        `}</style>
        <div className="error-card">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: "60px", color: "#f39c12" }}></i>
          </div>
          <h3 className="mb-3" style={{ fontWeight: 700 }}>Device Not Found</h3>
          <p className="text-muted mb-4">{error || 'The device you are looking for does not exist.'}</p>
          <div className="d-flex gap-3 justify-content-center">
            <button onClick={() => navigate(-1)} className="btn-outline-gradient">
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </button>
            <Link to="/browse" className="btn-gradient-primary">
              Browse All Devices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const savings = calculateSavings();
  const totalPrice = device.price * rentalDuration;
  const discountedTotal = savings > 0 ? totalPrice - savings : totalPrice;

  return (
    <div className={`product-page-container ${animateIn ? 'fade-in' : ''}`}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .product-page-container {
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
          
          .slide-in-right {
            animation: slideInRight 0.5s ease-out;
          }
          
          .scale-in {
            animation: scaleIn 0.4s ease-out;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
          }
          
          .btn-gradient-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            color: white;
          }
          
          .btn-outline-gradient {
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 10px 26px;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
          }
          
          .btn-outline-gradient:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent;
            color: white;
            transform: translateY(-2px);
          }
          
          .breadcrumb-custom {
            background: white;
            padding: 12px 20px;
            border-radius: 50px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .product-image-main {
            width: 100%;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          
          .product-image-main:hover {
            transform: scale(1.02);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
          }
          
          .spec-card {
            background: white;
            border-radius: 16px;
            padding: 16px;
            transition: all 0.3s ease;
            border: 1px solid #e0e0e0;
          }
          
          .spec-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            border-color: #667eea;
          }
          
          .price-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
            padding: 20px;
          }
          
          .rental-slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e0e0e0;
            outline: none;
            -webkit-appearance: none;
          }
          
          .rental-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #667eea;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
            transition: all 0.2s ease;
          }
          
          .rental-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
          
          .success-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
            max-width: 350px;
            width: 90%;
          }
          
          @media (max-width: 768px) {
            .product-page-container {
              padding: 1rem;
            }
            
            .breadcrumb-custom {
              padding: 8px 16px;
              font-size: 12px;
            }
            
            .btn-gradient-primary,
            .btn-outline-gradient {
              padding: 10px 20px;
              font-size: 14px;
            }
            
            .success-toast {
              top: 10px;
              right: 10px;
              left: 10px;
              max-width: none;
            }
          }
          
          @media (max-width: 576px) {
            .spec-card {
              padding: 12px;
            }
            
            .price-badge {
              padding: 16px;
            }
          }
        `}
      </style>

      <div className="container">
        {/* Success Toast */}
        {showSuccess && (
          <div className="success-toast alert alert-success border-0 shadow-lg">
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle fa-lg me-3"></i>
              <div className="flex-grow-1">
                <strong className="d-block">Added to Cart!</strong>
                <small>{device.name} for {rentalDuration} days</small>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="mb-4 slide-in-left">
          <nav className="breadcrumb-custom">
            <Link to="/" className="text-decoration-none text-secondary">
              <i className="fas fa-home me-1"></i>Home
            </Link>
            <i className="fas fa-chevron-right text-muted" style={{ fontSize: "12px" }}></i>
            <Link to="/browse" className="text-decoration-none text-secondary">Browse</Link>
            <i className="fas fa-chevron-right text-muted" style={{ fontSize: "12px" }}></i>
            <span className="text-primary fw-semibold">{device.name}</span>
          </nav>
        </div>

        <div className="row g-4">
          {/* Image Gallery */}
          <div className="col-lg-6 slide-in-left" style={{ animationDelay: "0.1s" }}>
            <div className="position-relative">
              {!imageLoaded && (
                <div className="skeleton-image" style={{
                  width: "100%",
                  height: "400px",
                  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                  backgroundSize: "1000px 100%",
                  animation: "shimmer 1.5s infinite",
                  borderRadius: "24px"
                }}></div>
              )}
              <img 
                src={selectedImage || device.image} 
                alt={device.name} 
                className={`product-image-main ${imageLoaded ? 'fade-in' : 'd-none'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              <div className="position-absolute top-0 end-0 m-3">
                <span className={`badge ${device.available ? 'bg-success' : 'bg-danger'} px-3 py-2 fs-6`}>
                  <i className={`fas ${device.available ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                  {device.available ? 'Available' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="col-lg-6 slide-in-right" style={{ animationDelay: "0.2s" }}>
            <div className="product-details">
              <div className="mb-4">
                <h1 className="display-6 fw-bold mb-2" style={{ 
                  background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent"
                }}>
                  {device.name}
                </h1>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                    <i className="fas fa-tag me-1"></i>
                    {device.brand}
                  </span>
                  <span className="text-muted">
                    <i className="fas fa-map-marker-alt me-1 text-primary"></i>
                    {device.location}
                  </span>
                  <span className="text-muted">
                    <i className="fas fa-star text-warning me-1"></i>
                    4.8 (128 reviews)
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="price-badge mb-4">
                <div className="d-flex align-items-baseline justify-content-between flex-wrap">
                  <div>
                    <span className="text-white-50">Rental Price</span>
                    <div className="d-flex align-items-baseline">
                      <span className="display-4 fw-bold">₹{device.price}</span>
                      <span className="ms-2 text-white-50">/ day</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <i className="fas fa-truck fa-2x text-white-50"></i>
                    <div className="small text-white-50">Free Delivery</div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="mb-4">
                <h4 className="fw-semibold mb-3">
                  <i className="fas fa-microchip text-primary me-2"></i>
                  Key Specifications
                </h4>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="spec-card">
                      <i className="fas fa-microchip text-primary mb-2" style={{ fontSize: "20px" }}></i>
                      <div className="small text-muted">Processor</div>
                      <div className="fw-semibold">{device.specs.processor}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="spec-card">
                      <i className="fas fa-memory text-primary mb-2" style={{ fontSize: "20px" }}></i>
                      <div className="small text-muted">RAM</div>
                      <div className="fw-semibold">{device.specs.ram}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="spec-card">
                      <i className="fas fa-hdd text-primary mb-2" style={{ fontSize: "20px" }}></i>
                      <div className="small text-muted">Storage</div>
                      <div className="fw-semibold">{device.specs.storage}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="spec-card">
                      <i className="fas fa-desktop text-primary mb-2" style={{ fontSize: "20px" }}></i>
                      <div className="small text-muted">Display</div>
                      <div className="fw-semibold">{device.specs.display}</div>
                    </div>
                  </div>
                </div>
              </div>

              {device.available ? (
                <div className="rental-section scale-in">
                  <h4 className="fw-semibold mb-3">
                    <i className="fas fa-calendar-alt text-primary me-2"></i>
                    Rental Options
                  </h4>
                  
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <label className="form-label fw-semibold mb-3">
                        Rental Duration: <span className="text-primary fs-4">{rentalDuration}</span> days
                      </label>
                      <input 
                        type="range" 
                        className="rental-slider" 
                        min="1" 
                        max="30" 
                        value={rentalDuration}
                        onChange={(e) => handleRentalDurationChange(e.target.value)}
                      />
                      <div className="d-flex justify-content-between text-muted mt-2">
                        <span>1 day</span>
                        <span>7 days</span>
                        <span>14 days</span>
                        <span>30 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-gradient-primary text-white mb-4 border-0">
                    <div className="card-body text-center py-4">
                      <h5 className="card-title mb-2 opacity-75">Total Rental Cost</h5>
                      <div className="display-5 fw-bold mb-2">₹{discountedTotal}</div>
                      {savings > 0 && (
                        <div className="mb-2">
                          <span className="badge bg-warning text-dark">
                            <i className="fas fa-tag me-1"></i>
                            Save ₹{savings} (10% weekly discount)
                          </span>
                        </div>
                      )}
                      <p className="mb-0 opacity-75 small">
                        ₹{device.price} × {rentalDuration} days
                        {savings > 0 && <span className="ms-2"><s>₹{totalPrice}</s></span>}
                      </p>
                    </div>
                  </div>

                  <div className="d-grid gap-3">
                    <button 
                      className="btn-gradient-primary w-100 justify-content-center py-3"
                      onClick={handleAddToCart}
                    >
                      <i className="fas fa-cart-plus me-2"></i>
                      Add to Cart - ₹{discountedTotal}
                    </button>
                    <Link to="/browse" className="btn-outline-gradient w-100 justify-content-center">
                      <i className="fas fa-laptop me-2"></i>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning border-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle fa-2x me-3"></i>
                    <div>
                      <h5 className="alert-heading mb-1">Currently Unavailable</h5>
                      <p className="mb-0">This laptop is not available for rental at the moment. Please check back later.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="row mt-5 slide-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-4">
                <h4 className="fw-semibold mb-0">
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  Product Description
                </h4>
              </div>
              <div className="card-body pt-0">
                <p className="card-text mb-3" style={{ lineHeight: 1.8 }}>
                  The <strong className="text-primary">{device.name}</strong> from {device.brand} is a {device.specs.ram.includes('16') ? 'high-performance powerhouse' : 'reliable workhorse'} perfect for {device.specs.ram.includes('16') ? 'demanding tasks, gaming, and professional creative work' : 'everyday computing, studies, and business tasks'}. 
                  With its <strong>{device.specs.processor}</strong> processor and <strong>{device.specs.ram}</strong> of RAM, it handles multitasking with exceptional ease. 
                  The <strong>{device.specs.storage}</strong> storage provides ample space for all your files, applications, and creative projects.
                </p>
                <p className="card-text mb-0" style={{ lineHeight: 1.8 }}>
                  Featuring a <strong>{device.specs.display}</strong> display{device.specs.graphics && <span> and <strong>{device.specs.graphics}</strong> graphics</span>}, 
                  this laptop delivers {device.specs.display.includes('4K') ? 'breathtaking visual quality' : 'crisp and clear visuals'} for all your needs. 
                  Whether you're working on complex projects, creative endeavors, or everyday computing tasks, 
                  this laptop offers reliable performance in a portable, stylish package.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;