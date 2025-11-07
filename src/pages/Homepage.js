import React from 'react';
import { Link } from 'react-router-dom';
import DeviceCard from '../components/DeviceCard';

const Homepage = ({ devices, addToCart }) => {
  const featuredDevices = devices.slice(0, 3);

  // Inline styles
  const heroSectionStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '100px 0',
    textAlign: 'center'
  };

  const heroTitleStyle = {
    fontSize: '3rem',
    marginBottom: '1rem',
    fontWeight: 'bold'
  };

  const heroTextStyle = {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  };

  const featureContainerStyle = {
    transition: 'all 0.4s ease',
    borderRadius: '15px',
    border: '2px solid transparent',
    padding: '1.5rem',
    height: '100%'
  };

  const stepContainerStyle = {
    transition: 'all 0.4s ease',
    borderRadius: '15px',
    border: '2px solid transparent',
    padding: '1.5rem',
    height: '100%'
  };

  const stepNumberStyle = {
    width: '70px',
    height: '70px',
    fontSize: '1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    transition: 'all 0.4s ease'
  };

  // Hover handlers
  const handleFeatureHover = (e) => {
    const container = e.currentTarget;
    const icon = container.querySelector('.feature-icon i');
    
    container.style.transform = 'translateY(-10px)';
    container.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
    container.style.borderColor = '#007bff';
    container.style.background = 'linear-gradient(135deg, #f8f9ff, #ffffff)';
    
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(5deg)';
      
      // Change icon color based on type
      if (icon.classList.contains('fa-laptop')) {
        icon.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        icon.style.webkitBackgroundClip = 'text';
        icon.style.webkitTextFillColor = 'transparent';
      } else if (icon.classList.contains('fa-shipping-fast')) {
        icon.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        icon.style.webkitBackgroundClip = 'text';
        icon.style.webkitTextFillColor = 'transparent';
      } else if (icon.classList.contains('fa-headset')) {
        icon.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
        icon.style.webkitBackgroundClip = 'text';
        icon.style.webkitTextFillColor = 'transparent';
      }
    }
    
    const heading = container.querySelector('h4');
    if (heading) {
      heading.style.color = '#007bff';
      heading.style.transform = 'translateY(-2px)';
    }
  };

  const handleFeatureLeave = (e) => {
    const container = e.currentTarget;
    const icon = container.querySelector('.feature-icon i');
    
    container.style.transform = 'translateY(0)';
    container.style.boxShadow = '';
    container.style.borderColor = 'transparent';
    container.style.background = '';
    
    if (icon) {
      icon.style.transform = '';
      icon.style.background = '';
      icon.style.webkitBackgroundClip = '';
      icon.style.webkitTextFillColor = '';
      icon.style.color = '#007bff'; // Reset to original color
    }
    
    const heading = container.querySelector('h4');
    if (heading) {
      heading.style.color = '';
      heading.style.transform = '';
    }
  };

  const handleStepHover = (e) => {
    const container = e.currentTarget;
    const stepNumber = container.querySelector('.step-number span');
    const heading = container.querySelector('h4');
    
    container.style.transform = 'translateY(-10px)';
    container.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
    container.style.borderColor = '#007bff';
    container.style.background = 'linear-gradient(135deg, #f8f9ff, #ffffff)';
    
    if (stepNumber) {
      stepNumber.style.transform = 'scale(1.2)';
      stepNumber.style.background = 'linear-gradient(135deg, #0056b3, #007bff)';
      stepNumber.style.boxShadow = '0 10px 25px rgba(0,123,255,0.3)';
    }
    
    if (heading) {
      heading.style.color = '#007bff';
      heading.style.transform = 'translateY(-2px)';
    }
  };

  const handleStepLeave = (e) => {
    const container = e.currentTarget;
    const stepNumber = container.querySelector('.step-number span');
    const heading = container.querySelector('h4');
    
    container.style.transform = 'translateY(0)';
    container.style.boxShadow = '';
    container.style.borderColor = 'transparent';
    container.style.background = '';
    
    if (stepNumber) {
      stepNumber.style.transform = '';
      stepNumber.style.background = '#007bff';
      stepNumber.style.boxShadow = '';
    }
    
    if (heading) {
      heading.style.color = '';
      heading.style.transform = '';
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div className="container">
          <h1 style={heroTitleStyle}>Rent High-Quality Laptops</h1>
          <p style={heroTextStyle}>
            Get the latest laptops for work, gaming, or creative projects. Flexible rental periods and competitive prices.
          </p>
          <Link to="/browse" className="btn btn-light btn-lg">Browse Laptops</Link>
        </div>
      </section>

      {/* Features Section with Animations */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-md-12">
              <h2 className="mb-3">Why Choose Quick Tech Rent?</h2>
              <p className="lead text-muted">We make laptop rental simple and affordable</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 text-center mb-4">
              <div 
                className="feature-container h-100"
                style={featureContainerStyle}
                onMouseEnter={handleFeatureHover}
                onMouseLeave={handleFeatureLeave}
              >
                <div className="feature-icon mb-4">
                  <div className="icon-wrapper">
                    <i className="fas fa-laptop fa-3x text-primary"></i>
                  </div>
                </div>
                <h4 className="mb-3">Latest Models</h4>
                <p className="text-muted mb-0">
                  Access the newest laptop models from top brands like Apple, Dell, HP, and more.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div 
                className="feature-container h-100"
                style={featureContainerStyle}
                onMouseEnter={handleFeatureHover}
                onMouseLeave={handleFeatureLeave}
              >
                <div className="feature-icon mb-4">
                  <div className="icon-wrapper">
                    <i className="fas fa-shipping-fast fa-3x text-primary"></i>
                  </div>
                </div>
                <h4 className="mb-3">Fast Delivery</h4>
                <p className="text-muted mb-0">
                  Get your laptop delivered to your doorstep within 24 hours in most locations.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div 
                className="feature-container h-100"
                style={featureContainerStyle}
                onMouseEnter={handleFeatureHover}
                onMouseLeave={handleFeatureLeave}
              >
                <div className="feature-icon mb-4">
                  <div className="icon-wrapper">
                    <i className="fas fa-headset fa-3x text-primary"></i>
                  </div>
                </div>
                <h4 className="mb-3">24/7 Support</h4>
                <p className="text-muted mb-0">
                  Our support team is available round the clock to assist you with any issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Laptops */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row mb-4">
            <div className="col-md-12">
              <h2 className="text-center mb-3">Featured Laptops</h2>
              <p className="text-center lead text-muted">Check out our most popular rental options</p>
            </div>
          </div>
          <div className="row justify-content-center">
            {featuredDevices.map(device => (
              <div key={device.id} className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">
                <DeviceCard 
                  device={device} 
                  addToCart={addToCart} // Now using the actual addToCart function
                />
              </div>
            ))}
          </div>
          <div className="row mt-4">
            <div className="col-md-12 text-center">
              <Link to="/browse" className="btn btn-primary btn-lg">View All Laptops</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with Animations */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-12 text-center">
              <h2 className="mb-3">How It Works</h2>
              <p className="lead text-muted">Renting a laptop has never been easier</p>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 text-center mb-5">
              <div 
                className="step-container h-100"
                style={stepContainerStyle}
                onMouseEnter={handleStepHover}
                onMouseLeave={handleStepLeave}
              >
                <div className="step-number mb-4">
                  <span style={stepNumberStyle}>
                    1
                  </span>
                </div>
                <h4 className="mb-3">Browse & Select</h4>
                <p className="text-muted mb-0">
                  Choose from our wide selection of laptops based on your needs and budget.
                </p>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 text-center mb-5">
              <div 
                className="step-container h-100"
                style={stepContainerStyle}
                onMouseEnter={handleStepHover}
                onMouseLeave={handleStepLeave}
              >
                <div className="step-number mb-4">
                  <span style={stepNumberStyle}>
                    2
                  </span>
                </div>
                <h4 className="mb-3">Add to Cart</h4>
                <p className="text-muted mb-0">
                  Select your rental duration and add the laptop to your cart.
                </p>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 text-center mb-5">
              <div 
                className="step-container h-100"
                style={stepContainerStyle}
                onMouseEnter={handleStepHover}
                onMouseLeave={handleStepLeave}
              >
                <div className="step-number mb-4">
                  <span style={stepNumberStyle}>
                    3
                  </span>
                </div>
                <h4 className="mb-3">Checkout</h4>
                <p className="text-muted mb-0">
                  Provide your delivery address and complete your order securely.
                </p>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 text-center mb-5">
              <div 
                className="step-container h-100"
                style={stepContainerStyle}
                onMouseEnter={handleStepHover}
                onMouseLeave={handleStepLeave}
              >
                <div className="step-number mb-4">
                  <span style={stepNumberStyle}>
                    4
                  </span>
                </div>
                <h4 className="mb-3">Enjoy</h4>
                <p className="text-muted mb-0">
                  Receive your laptop and use it for your project, work, or studies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;