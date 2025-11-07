import React from 'react';
import { Link } from 'react-router-dom';

const DeviceCard = ({ device, addToCart }) => {
  if (!device) {
    return null;
  }

  const {
    id,
    name = 'Unknown Device',
    brand = 'Unknown Brand',
    price = 0,
    image = 'https://via.placeholder.com/300x200/6c757d/ffffff?text=No+Image',
    specs = {},
    available = false,
    location = 'Unknown Location'
  } = device;

  const {
    processor = 'Not specified',
    ram = 'Not specified',
    storage = 'Not specified'
  } = specs;

  // Inline styles
  const cardStyle = {
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const imageStyle = {
    height: '180px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  };

  const quickActionsStyle = {
    transition: 'all 0.3s ease',
    opacity: 0,
    pointerEvents: 'none'
  };

  const quickActionBtnStyle = {
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease'
  };

  const deviceNameStyle = {
    transition: 'color 0.2s ease'
  };

  const priceValueStyle = {
    transition: 'transform 0.2s ease'
  };

  const actionBtnStyle = {
    transition: 'all 0.3s ease'
  };

  const mobileBtnStyle = {
    padding: '0.375rem 0.75rem',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Hover handlers
  const handleMouseEnter = (e) => {
    const card = e.currentTarget;
    const image = card.querySelector('.device-image');
    const quickActions = card.querySelector('.quick-actions');
    const deviceName = card.querySelector('.device-name');
    const priceValue = card.querySelector('.price-value');
    const actionBtns = card.querySelectorAll('.action-btn');
    
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    
    if (image) image.style.transform = 'scale(1.05)';
    if (quickActions) {
      quickActions.style.opacity = '1';
      quickActions.style.backgroundColor = 'rgba(0,0,0,0.5)';
      quickActions.style.pointerEvents = 'auto';
    }
    if (deviceName) deviceName.style.color = '#007bff';
    if (priceValue) priceValue.style.transform = 'scale(1.1)';
    
    actionBtns.forEach(btn => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    const image = card.querySelector('.device-image');
    const quickActions = card.querySelector('.quick-actions');
    const deviceName = card.querySelector('.device-name');
    const priceValue = card.querySelector('.price-value');
    const actionBtns = card.querySelectorAll('.action-btn');
    
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '';
    
    if (image) image.style.transform = 'scale(1)';
    if (quickActions) {
      quickActions.style.opacity = '0';
      quickActions.style.backgroundColor = 'rgba(0,0,0,0)';
      quickActions.style.pointerEvents = 'none';
    }
    if (deviceName) deviceName.style.color = '';
    if (priceValue) priceValue.style.transform = 'scale(1)';
    
    actionBtns.forEach(btn => {
      btn.style.transform = '';
      btn.style.boxShadow = '';
    });
  };

  const handleQuickActionHover = (e) => {
    e.currentTarget.style.transform = 'scale(1.1)';
    e.stopPropagation();
  };

  const handleQuickActionLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.stopPropagation();
  };

  // Fixed mobile touch handler
  const handleMobileTouch = (e) => {
    const button = e.currentTarget;
    button.style.transform = 'scale(0.95)';
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Check if button still exists before modifying it
        if (button && button.style) {
          button.style.transform = '';
        }
      }, 100);
    });
  };

  return (
    <div 
      className="card h-100 shadow-sm border-0 device-card"
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="position-relative overflow-hidden">
        <img 
          src={image} 
          className="card-img-top device-image" 
          alt={name}
          style={imageStyle}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200/6c757d/ffffff?text=No+Image';
          }}
        />
        <span className={`badge position-absolute top-0 end-0 m-2 ${available ? 'bg-success' : 'bg-danger'}`}>
          {available ? 'Available' : 'Not Available'}
        </span>
        
        {/* Quick Action Overlay */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center quick-actions d-none d-md-flex"
          style={quickActionsStyle}
        >
          <div className="d-flex gap-2">
            <Link 
              to={`/product/${id}`} 
              className="btn btn-light btn-sm rounded-circle"
              style={quickActionBtnStyle}
              title="View Details"
              onMouseEnter={handleQuickActionHover}
              onMouseLeave={handleQuickActionLeave}
            >
              <i className="fas fa-eye"></i>
            </Link>
            <button 
              className={`btn btn-sm rounded-circle ${available ? 'btn-primary' : 'btn-secondary'}`}
              style={quickActionBtnStyle}
              onClick={() => addToCart(device)}
              disabled={!available}
              title={available ? 'Add to Cart' : 'Not Available'}
              onMouseEnter={handleQuickActionHover}
              onMouseLeave={handleQuickActionLeave}
            >
              <i className="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body d-flex flex-column p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-light text-dark">{brand}</span>
          <small className="text-muted">
            <i className="fas fa-map-marker-alt me-1"></i>
            {location}
          </small>
        </div>

        <h6 
          className="card-title mb-2 fw-bold text-dark device-name" 
          style={deviceNameStyle}
        >
          {name}
        </h6>

        <div className="specs mb-3">
          <small className="text-muted d-block">
            <i className="fas fa-microchip me-1"></i>
            {processor}
          </small>
          <small className="text-muted">
            <i className="fas fa-memory me-1"></i>
            {ram} • <i className="fas fa-hdd me-1"></i>
            {storage}
          </small>
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <div className="price-section">
              <div 
                className="fw-bold text-primary price-value" 
                style={priceValueStyle}
              >
                ₹{price}
              </div>
              <small className="text-muted">per day</small>
            </div>
            {/* Always visible action buttons */}
            <div className="d-flex gap-1">
              <Link 
                to={`/product/${id}`} 
                className="btn btn-outline-primary btn-sm action-btn"
                title="View Details"
                style={{ ...actionBtnStyle, ...mobileBtnStyle }}
                onTouchStart={handleMobileTouch}
              >
                <i className="fas fa-info"></i>
              </Link>
              <button 
                className={`btn btn-sm action-btn ${available ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => addToCart(device)}
                disabled={!available}
                title={available ? 'Add to Cart' : 'Not Available'}
                style={{ ...actionBtnStyle, ...mobileBtnStyle }}
                onTouchStart={handleMobileTouch}
              >
                <i className="fas fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;