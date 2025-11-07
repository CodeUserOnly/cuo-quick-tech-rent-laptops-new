import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Inline styles for hover effects
  const hoverLiftStyle = {
    transition: 'all 0.2s ease-in-out'
  };

  const socialLinkStyle = {
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none'
  };

  const handleHover = (e) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.color = '#007bff';
  };

  const handleHoverOut = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.opacity = '0.75';
    e.currentTarget.style.color = '';
  };

  const handleSocialHover = (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.color = '#007bff';
  };

  const handleSocialHoverOut = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.opacity = '0.75';
    e.currentTarget.style.color = '#fff';
  };

  return (
    <footer className="footer bg-dark text-light pt-5 pb-4">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="d-flex align-items-center mb-3">
              <h5 className="fw-bold text-primary mb-0">Quick Tech Rent</h5>
              <span className="badge bg-warning text-dark ms-2 small">ALPHA</span>
            </div>
            <p className="text-light opacity-75 mb-3">
              Your trusted partner for premium laptop rentals. We provide high-quality laptops 
              for professionals, students, and businesses with flexible rental options.
            </p>
            <div className="social-links">
              <button 
                className="btn btn-link text-light p-0 me-3 opacity-75"
                style={socialLinkStyle}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialHoverOut}
              >
                <i className="fab fa-facebook-f"></i>
              </button>
              <button 
                className="btn btn-link text-light p-0 me-3 opacity-75"
                style={socialLinkStyle}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialHoverOut}
              >
                <i className="fab fa-twitter"></i>
              </button>
              <button 
                className="btn btn-link text-light p-0 me-3 opacity-75"
                style={socialLinkStyle}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialHoverOut}
              >
                <i className="fab fa-linkedin-in"></i>
              </button>
              <button 
                className="btn btn-link text-light p-0 opacity-75"
                style={socialLinkStyle}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialHoverOut}
              >
                <i className="fab fa-instagram"></i>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-semibold text-uppercase text-primary mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link 
                  to="/" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-home me-2 small"></i>Home
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/browse" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-laptop me-2 small"></i>Browse Laptops
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/support" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-headset me-2 small"></i>Support
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/about" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-info-circle me-2 small"></i>About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-semibold text-uppercase text-primary mb-3">Customer Service</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link 
                  to="/support" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-envelope me-2 small"></i>Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/support" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-question-circle me-2 small"></i>FAQs
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/support" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-shipping-fast me-2 small"></i>Shipping Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/support" 
                  className="text-light opacity-75 text-decoration-none"
                  style={hoverLiftStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleHoverOut}
                >
                  <i className="fas fa-undo me-2 small"></i>Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-semibold text-uppercase text-primary mb-3">Contact Info</h6>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <i className="fas fa-envelope text-primary mt-1 me-2 small"></i>
                <div>
                  <div className="text-light fw-medium">Email</div>
                  <a 
                    href="mailto:quicktechrent@gmail.com" 
                    className="text-light opacity-75 text-decoration-none"
                    style={hoverLiftStyle}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleHoverOut}
                  >
                    quicktechrent@gmail.com
                  </a>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="fas fa-phone text-primary mt-1 me-2 small"></i>
                <div>
                  <div className="text-light fw-medium">Phone</div>
                  <a 
                    href="tel:+919769602148" 
                    className="text-light opacity-75 text-decoration-none"
                    style={hoverLiftStyle}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleHoverOut}
                  >
                    +91 9769602148
                  </a>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1 me-2 small"></i>
                <div>
                  <div className="text-light fw-medium">Address</div>
                  <span className="text-light opacity-75">
                    123 Tech Street<br />
                    Silicon Valley, Mumbai 400042
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-4 border-secondary" />

        {/* Copyright */}
        <div className="row">
          <div className="col-md-12 text-center">
            <p className="mb-0 text-light opacity-75 small">
              &copy; {new Date().getFullYear()} Quick Tech Rent. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;