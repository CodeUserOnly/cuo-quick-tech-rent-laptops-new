import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, cartCount, logoutUser }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <style>{`
        /* Reset any header-related conflicts */
        .quicktech-header {
          all: initial;
          display: block;
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .quicktech-header * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Main Header Styles */
        .quicktech-header .header-wrapper {
          background: ${scrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff'};
          box-shadow: ${scrolled ? '0 2px 10px rgba(0, 0, 0, 0.08)' : '0 1px 0 rgba(0, 0, 0, 0.05)'};
          transition: all 0.3s ease;
          position: relative;
        }

        .quicktech-header .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          position: relative;
        }

        /* Logo Section */
        .quicktech-header .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .quicktech-header .alpha-badge {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          padding: 4px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quicktech-header .alpha-badge span {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        .quicktech-header .logo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          white-space: nowrap;
        }

        .quicktech-header .logo-icon {
          font-size: 24px;
          display: flex;
          align-items: center;
        }

        .quicktech-header .logo-text {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px;
          white-space: nowrap;
        }

        /* Desktop Navigation */
        .quicktech-header .nav-menu {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .quicktech-header .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
        }

        .quicktech-header .nav-item {
          list-style: none;
        }

        .quicktech-header .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          text-decoration: none;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }

        .quicktech-header .nav-link i {
          font-size: 14px;
          flex-shrink: 0;
        }

        .quicktech-header .nav-link span {
          white-space: nowrap;
        }

        .quicktech-header .nav-link:hover {
          background: #f3f4f6;
          color: #2563eb;
        }

        .quicktech-header .nav-link.active {
          color: #2563eb;
          background: #eff6ff;
        }

        /* User Navigation */
        .quicktech-header .user-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin-left: 8px;
        }

        /* Cart Styles - Desktop */
        .quicktech-header .cart-wrapper {
          position: relative;
        }

        .quicktech-header .cart-count {
          position: absolute;
          top: -4px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          line-height: 1;
        }

        /* Button Styles */
        .quicktech-header .btn-logout {
          background: #fee2e2;
          color: #dc2626;
        }

        .quicktech-header .btn-logout:hover {
          background: #dc2626;
          color: white;
        }

        /* Sign Up Button - Fixed Hover Effect */
        .quicktech-header .btn-signup {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white !important;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .quicktech-header .btn-signup:hover {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          color: white !important;
        }

        .quicktech-header .btn-signup:active {
          transform: translateY(0);
          transition: transform 0.05s;
        }

        /* Admin Link Styles */
        .quicktech-header .admin-link {
          background: #f3e8ff;
          color: #8b5cf6;
        }

        .quicktech-header .admin-link:hover {
          background: #e9d5ff;
          color: #7c3aed;
        }

        /* Mobile Menu Button */
        .quicktech-header .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          width: 44px;
          height: 44px;
          position: relative;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
          z-index: 1002;
          align-items: center;
          justify-content: center;
        }

        .quicktech-header .hamburger {
          position: relative;
          display: block;
          width: 22px;
          height: 2px;
          background: #1f2937;
          transition: all 0.2s ease;
        }

        .quicktech-header .hamburger::before,
        .quicktech-header .hamburger::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 2px;
          background: #1f2937;
          left: 0;
          transition: all 0.2s ease;
        }

        .quicktech-header .hamburger::before {
          top: -7px;
        }

        .quicktech-header .hamburger::after {
          bottom: -7px;
        }

        .quicktech-header .mobile-toggle.active .hamburger {
          background: transparent;
        }

        .quicktech-header .mobile-toggle.active .hamburger::before {
          transform: rotate(45deg);
          top: 0;
        }

        .quicktech-header .mobile-toggle.active .hamburger::after {
          transform: rotate(-45deg);
          bottom: 0;
        }

        /* Laptop Responsive - Prevent Text Wrapping and Button Touching */
        @media (max-width: 1100px) {
          .quicktech-header .container {
            padding: 0 20px;
          }
          
          .quicktech-header .nav-menu {
            gap: 12px;
          }
          
          .quicktech-header .nav-link {
            padding: 6px 10px;
            font-size: 13px;
          }
          
          .quicktech-header .nav-link i {
            font-size: 13px;
          }
          
          .quicktech-header .user-nav {
            margin-left: 4px;
          }
        }

        @media (max-width: 1000px) {
          .quicktech-header .container {
            padding: 0 16px;
          }
          
          .quicktech-header .nav-menu {
            gap: 8px;
          }
          
          .quicktech-header .nav-links {
            gap: 2px;
          }
          
          .quicktech-header .user-nav {
            gap: 2px;
            margin-left: 4px;
          }
          
          .quicktech-header .nav-link {
            padding: 6px 8px;
            font-size: 12px;
          }
          
          .quicktech-header .nav-link i {
            font-size: 12px;
          }
          
          .quicktech-header .logo-text {
            font-size: 15px;
          }
          
          .quicktech-header .logo-icon {
            font-size: 18px;
          }
          
          .quicktech-header .alpha-badge {
            padding: 3px 8px;
          }
          
          .quicktech-header .alpha-badge span {
            font-size: 10px;
          }
        }

        @media (max-width: 900px) {
          .quicktech-header .nav-link {
            padding: 6px 6px;
            font-size: 11px;
          }
          
          .quicktech-header .nav-link i {
            font-size: 11px;
          }
          
          .quicktech-header .nav-menu {
            gap: 6px;
          }
        }

        /* Mobile Menu - Optimized for Android with LEFT ALIGNMENT */
        @media (max-width: 768px) {
          .quicktech-header .container {
            height: 56px;
            padding: 0 16px;
          }

          .quicktech-header .logo-text {
            font-size: 16px;
            white-space: nowrap;
          }

          .quicktech-header .logo-icon {
            font-size: 20px;
          }

          .quicktech-header .alpha-badge {
            padding: 3px 8px;
          }

          .quicktech-header .alpha-badge span {
            font-size: 10px;
          }

          .quicktech-header .mobile-toggle {
            display: flex;
          }

          /* Hide desktop navigation */
          .quicktech-header .nav-links,
          .quicktech-header .user-nav {
            display: flex;
          }

          /* Sidebar Menu - LEFT ALIGNED for Android */
          .quicktech-header .nav-menu {
            position: fixed;
            top: 0;
            left: -100%;
            right: auto;
            width: 280px;
            max-width: 85%;
            height: 100vh;
            background: #ffffff;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 80px 20px 30px;
            gap: 20px;
            transition: left 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            z-index: 1001;
            box-shadow: 5px 0 25px rgba(0, 0, 0, 0.15);
            overflow-y: auto;
            overflow-x: hidden;
          }

          .quicktech-header .nav-menu.active {
            left: 0;
          }

          /* Smooth scroll for Android */
          .quicktech-header .nav-menu::-webkit-scrollbar {
            width: 4px;
          }

          .quicktech-header .nav-menu::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          .quicktech-header .nav-menu::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }

          /* Left align all content */
          .quicktech-header .nav-links,
          .quicktech-header .user-nav {
            flex-direction: column;
            width: 100%;
            gap: 8px;
            margin-left: 0;
            align-items: flex-start;
          }

          .quicktech-header .nav-link {
            width: 100%;
            padding: 12px 16px;
            justify-content: space-between;
            font-size: 16px;
            border-radius: 12px;
            text-align: left;
            white-space: normal;
            position: relative;
          }

          .quicktech-header .nav-link span:first-of-type {
            white-space: normal;
            text-align: left;
            flex: 1;
          }

          .quicktech-header .nav-link i {
            font-size: 18px;
            width: 24px;
            margin-right: 12px;
            flex-shrink: 0;
          }

          /* Cart Styles - Mobile Sidebar */
          .quicktech-header .cart-wrapper {
            width: 100%;
          }

          .quicktech-header .cart-wrapper .nav-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
          }

          .quicktech-header .cart-wrapper .cart-count {
            position: relative;
            top: auto;
            right: auto;
            margin-left: auto;
            background: #ef4444;
            color: white;
            font-size: 12px;
            font-weight: 700;
            min-width: 24px;
            height: 24px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
            line-height: 1;
            flex-shrink: 0;
          }

          /* Sign Up Button on Mobile */
          .quicktech-header .btn-signup {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white !important;
            justify-content: center;
          }

          .quicktech-header .btn-signup:hover {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: white !important;
          }

          .quicktech-header .btn-logout {
            justify-content: center;
          }

          /* Ensure all text is left aligned */
          .quicktech-header .nav-link span {
            text-align: left;
          }
        }

        /* Android Overlay */
        .quicktech-header .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .quicktech-header .mobile-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Android Touch Optimizations */
        @media (hover: none) and (pointer: coarse) {
          .quicktech-header .nav-link:active,
          .quicktech-header .mobile-toggle:active {
            transform: scale(0.96);
            transition: transform 0.05s;
            opacity: 0.7;
          }
          
          .quicktech-header .nav-link,
          .quicktech-header .mobile-toggle,
          .quicktech-header .logo-link {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          /* Better touch targets */
          .quicktech-header .nav-link {
            min-height: 48px;
          }

          .quicktech-header .mobile-toggle {
            min-width: 48px;
            min-height: 48px;
          }
        }

        /* Small screens optimization */
        @media (max-width: 480px) {
          .quicktech-header .container {
            padding: 0 12px;
          }
          
          .quicktech-header .logo-area {
            gap: 8px;
          }
          
          .quicktech-header .logo-text {
            font-size: 14px;
            white-space: nowrap;
          }

          .quicktech-header .nav-menu {
            width: 260px;
            padding: 70px 16px 20px;
          }

          .quicktech-header .nav-link {
            padding: 10px 14px;
            font-size: 15px;
          }

          .quicktech-header .cart-wrapper .cart-count {
            min-width: 22px;
            height: 22px;
            font-size: 11px;
            padding: 0 5px;
          }
        }

        /* Landscape mode optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .quicktech-header .nav-menu {
            padding: 60px 20px 20px;
          }

          .quicktech-header .nav-links,
          .quicktech-header .user-nav {
            gap: 4px;
          }

          .quicktech-header .nav-link {
            padding: 8px 16px;
          }
        }
      `}</style>

      <div className="quicktech-header">
        <div className="header-wrapper">
          <div className="container">
            {/* Logo Section */}
            <div className="logo-area">
              <div className="alpha-badge">
                <span>ALPHA</span>
              </div>
              <Link to="/" className="logo-link">
                <span className="logo-icon">⚡</span>
                <span className="logo-text">Quick Tech Rent</span>
              </Link>
            </div>

            {/* Mobile Toggle Button */}
            <button 
              className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <span className="hamburger"></span>
            </button>

            {/* Navigation Menu - Sidebar for Mobile */}
            <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
              {/* Main Navigation */}
              <ul className="nav-links">
                <li className="nav-item">
                  <Link 
                    to="/" 
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/browse" 
                    className={`nav-link ${isActive('/browse') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-laptop"></i>
                    <span>Browse</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/support" 
                    className={`nav-link ${isActive('/support') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-headset"></i>
                    <span>Support</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/about" 
                    className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-info-circle"></i>
                    <span>About</span>
                  </Link>
                </li>
              </ul>

              {/* User Navigation */}
              <ul className="user-nav">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <li className="nav-item">
                        <Link 
                          to="/admin" 
                          className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <i className="fas fa-cog"></i>
                          <span>Admin</span>
                        </Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <Link 
                        to="/dashboard" 
                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className="fas fa-user-circle"></i>
                        <span>Dashboard</span>
                      </Link>
                    </li>
                    <li className="nav-item cart-wrapper">
                      <Link 
                        to="/cart" 
                        className="nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="cart-count">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <button 
                        className="nav-link btn-logout"
                        onClick={() => {
                          logoutUser();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link 
                        to="/login" 
                        className="nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className="fas fa-sign-in-alt"></i>
                        <span>Login</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="/signup" 
                        className="nav-link btn-signup"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className="fas fa-user-plus"></i>
                        <span>Sign Up</span>
                      </Link>
                    </li>
                    <li className="nav-item cart-wrapper">
                      <Link 
                        to="/cart" 
                        className="nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="cart-count">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Mobile Overlay */}
            <div 
              className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;