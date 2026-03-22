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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (available) {
      addToCart(device);
      // Visual feedback
      const button = e.currentTarget;
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (button) button.style.transform = '';
      }, 150);
    }
  };

  const handleViewDetails = (e) => {
    // No preventDefault to allow navigation
    e.stopPropagation();
  };

  return (
    <div className="device-card-wrapper">
      <style>
        {`
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
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          @keyframes glow {
            0% {
              box-shadow: 0 0 5px rgba(102, 126, 234, 0.2);
            }
            100% {
              box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
            }
          }
          
          .device-card-wrapper {
            animation: slideInUp 0.5s ease-out;
            animation-fill-mode: both;
            height: 100%;
          }
          
          .device-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .device-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          }
          
          .device-image-container {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            padding-top: 66.67%; /* 3:2 Aspect Ratio */
          }
          
          .device-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .device-card:hover .device-image {
            transform: scale(1.1);
          }
          
          .badge-availability {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 2;
            backdrop-filter: blur(8px);
            background: rgba(0, 0, 0, 0.7);
            color: white;
          }
          
          .badge-availability.available {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }
          
          .badge-availability.unavailable {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }
          
          .quick-actions-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 3;
          }
          
          .device-card:hover .quick-actions-overlay {
            opacity: 1;
          }
          
          .quick-action-btn {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            border: none;
            margin: 0 8px;
          }
          
          .quick-action-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }
          
          .quick-action-btn.view-btn:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .quick-action-btn.cart-btn:hover {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }
          
          .brand-badge {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            color: #4b5563;
          }
          
          .location-text {
            font-size: 12px;
            color: #9ca3af;
          }
          
          .device-name {
            font-size: 1rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
            transition: color 0.2s ease;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .device-card:hover .device-name {
            color: #667eea;
          }
          
          .spec-item {
            font-size: 12px;
            color: #6b7280;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .price {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            line-height: 1;
          }
          
          .price-label {
            font-size: 11px;
            color: #9ca3af;
            margin-left: 4px;
          }
          
          .action-btn {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
          }
          
          .action-btn.view-btn {
            background: white;
            border: 1px solid #e5e7eb;
            color: #6b7280;
          }
          
          .action-btn.view-btn:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent;
            color: white;
            transform: translateY(-2px);
          }
          
          .action-btn.cart-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .action-btn.cart-btn:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            opacity: 0.6;
          }
          
          .action-btn.cart-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
          
          /* Touch Feedback for Mobile */
          .action-btn:active {
            transform: scale(0.95);
          }
          
          /* Mobile Optimizations */
          @media (max-width: 768px) {
            .device-card {
              border-radius: 16px;
            }
            
            .quick-actions-overlay {
              display: none;
            }
            
            .action-btn {
              width: 44px;
              height: 44px;
              border-radius: 12px;
            }
            
            .action-btn.view-btn,
            .action-btn.cart-btn {
              min-width: 44px;
              min-height: 44px;
            }
            
            .price {
              font-size: 1.25rem;
            }
            
            .device-name {
              font-size: 0.95rem;
            }
            
            .brand-badge {
              font-size: 11px;
              padding: 3px 10px;
            }
          }
          
          @media (max-width: 576px) {
            .device-card {
              border-radius: 14px;
            }
            
            .badge-availability {
              padding: 4px 10px;
              font-size: 11px;
              top: 8px;
              right: 8px;
            }
            
            .action-btn {
              width: 40px;
              height: 40px;
            }
            
            .price {
              font-size: 1.125rem;
            }
            
            .spec-item {
              font-size: 11px;
            }
          }
          
          /* Loading Skeleton */
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 1.5s infinite;
          }
        `}
      </style>

      <div className="device-card">
        {/* Image Section */}
        <div className="device-image-container">
          <img 
            src={image} 
            className="device-image" 
            alt={name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200/6c757d/ffffff?text=No+Image';
            }}
          />
          
          {/* Availability Badge */}
          <div className={`badge-availability ${available ? 'available' : 'unavailable'}`}>
            <i className={`fas ${available ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
            {available ? 'Available' : 'Out of Stock'}
          </div>
          
          {/* Quick Actions Overlay (Desktop) */}
          <div className="quick-actions-overlay">
            <Link 
              to={`/product/${id}`} 
              className="quick-action-btn view-btn"
              onClick={handleViewDetails}
              title="View Details"
            >
              <i className="fas fa-eye fa-lg"></i>
            </Link>
            <button 
              className={`quick-action-btn cart-btn ${!available ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!available}
              title={available ? 'Add to Cart' : 'Not Available'}
            >
              <i className="fas fa-cart-plus fa-lg"></i>
            </button>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-3 d-flex flex-column flex-grow-1">
          {/* Brand and Location */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="brand-badge">
              <i className="fas fa-tag me-1" style={{ fontSize: "10px" }}></i>
              {brand}
            </span>
            <span className="location-text">
              <i className="fas fa-map-marker-alt me-1"></i>
              {location}
            </span>
          </div>

          {/* Device Name */}
          <h3 className="device-name">
            {name}
          </h3>

          {/* Specifications */}
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <span className="spec-item">
                <i className="fas fa-microchip"></i>
                {processor.split(' ').slice(0, 2).join(' ')}
              </span>
              <span className="spec-item">
                <i className="fas fa-memory"></i>
                {ram}
              </span>
              <span className="spec-item">
                <i className="fas fa-hdd"></i>
                {storage}
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-end">
              <div>
                <div className="price">
                  ₹{price.toLocaleString()}
                </div>
                <small className="price-label">per day</small>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="d-flex gap-2">
                <Link 
                  to={`/product/${id}`} 
                  className="action-btn view-btn"
                  onClick={handleViewDetails}
                  title="View Details"
                >
                  <i className="fas fa-eye"></i>
                </Link>
                <button 
                  className={`action-btn cart-btn ${!available ? 'disabled' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!available}
                  title={available ? 'Add to Cart' : 'Not Available'}
                >
                  <i className="fas fa-cart-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;