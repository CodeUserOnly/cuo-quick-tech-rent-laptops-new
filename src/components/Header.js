import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, cartCount, logoutUser }) => {
  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          {/* Brand with Alpha Badge */}
          <div className="d-flex align-items-center">
            {/* Alpha Badge positioned to the left */}
            <span className="badge bg-warning text-dark me-2 px-2 py-1 small" 
                  style={{fontSize: '0.6rem', fontWeight: '600'}}>
              ALPHA
            </span>
            
            {/* Brand Name */}
            <Link className="navbar-brand fw-bold text-primary" to="/">
              Quick Tech Rent
            </Link>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Main Navigation */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/">
                  <i className="fas fa-home me-1"></i>Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/browse">
                  <i className="fas fa-laptop me-1"></i>Browse Laptops
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/support">
                  <i className="fas fa-headset me-1"></i>Support
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/about">
                  <i className="fas fa-info-circle me-1"></i>About
                </Link>
              </li>
            </ul>

            {/* User Navigation */}
            <ul className="navbar-nav align-items-center">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <li className="nav-item">
                      <Link className="nav-link fw-medium text-danger" to="/admin">
                        <i className="fas fa-cog me-1"></i>Admin Panel
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <Link className="nav-link fw-medium" to="/dashboard">
                      <i className="fas fa-user-circle me-1"></i>Dashboard
                    </Link>
                  </li>
                  <li className="nav-item position-relative mx-2">
                    <Link className="nav-link fw-medium px-2" to="/cart">
                      <i className="fas fa-shopping-cart me-1"></i>Cart
                      {cartCount > 0 && (
                        <span className="badge bg-primary position-absolute top-0 start-100 rounded-pill" 
                              style={{
                                fontSize: '0.7rem', 
                                minWidth: '18px', 
                                height: '18px',
                                transform: 'translate(-8px, 2px)'
                              }}>
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="btn btn-outline-primary btn-sm fw-medium ms-2" 
                      onClick={logoutUser}
                      style={{borderWidth: '2px'}}
                    >
                      <i className="fas fa-sign-out-alt me-1"></i>Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link fw-medium" to="/login">
                      <i className="fas fa-sign-in-alt me-1"></i>Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link fw-medium" to="/signup">
                      <i className="fas fa-user-plus me-1"></i>Sign Up
                    </Link>
                  </li>
                  <li className="nav-item position-relative mx-2">
                    <Link className="nav-link fw-medium px-2" to="/cart">
                      <i className="fas fa-shopping-cart me-1"></i>Cart
                      {cartCount > 0 && (
                        <span className="badge bg-primary position-absolute top-0 start-100 rounded-pill" 
                              style={{
                                fontSize: '0.7rem', 
                                minWidth: '18px', 
                                height: '18px',
                                transform: 'translate(-8px, 2px)'
                              }}>
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;