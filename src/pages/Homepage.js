import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeviceCard from '../components/DeviceCard';

const Homepage = ({ devices, addToCart }) => {
  const featuredDevices = devices.slice(0, 3);

  useEffect(() => {
    // Add Android-specific optimizations
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
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
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      /* Android & Mobile Optimizations */
      * {
        -webkit-tap-highlight-color: transparent;
      }
      
      .homepage-android-optimized {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
      
      .animate-on-scroll {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      /* Better touch targets for Android */
      .clickable-card {
        min-height: 44px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Smooth scrolling */
      .smooth-scroll {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Reduce motion if user prefers */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Android hardware acceleration */
      @media (max-width: 768px) {
        .feature-card,
        .step-card,
        .hero-section {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.head.removeChild(styleSheet);
      observer.disconnect();
    };
  }, []);

  const styles = {
    heroSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '120px 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      marginBottom: '1rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.9))',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      animation: 'slideInLeft 0.8s ease-out',
    },
    heroText: {
      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
      marginBottom: '2rem',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      opacity: 0.95,
      animation: 'slideInRight 0.8s ease-out',
    },
    heroButton: {
      padding: '12px 32px',
      fontSize: '1.1rem',
      fontWeight: 600,
      borderRadius: '50px',
      background: 'white',
      color: '#667eea',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    sectionTitle: {
      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
      fontWeight: 700,
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    sectionSubtitle: {
      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
      color: '#6c757d',
      maxWidth: '700px',
      margin: '0 auto',
    },
    featureCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      height: '100%',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    featureIconWrapper: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #667eea20, #764ba220)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      transition: 'all 0.3s ease',
    },
    featureIcon: {
      fontSize: '2.5rem',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      transition: 'all 0.3s ease',
    },
    featureTitle: {
      fontSize: '1.3rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#2c3e50',
      transition: 'color 0.3s ease',
    },
    featureText: {
      color: '#6c757d',
      lineHeight: 1.6,
      margin: 0,
    },
    stepCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      height: '100%',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      textAlign: 'center',
    },
    stepNumber: {
      width: 'clamp(60px, 8vw, 70px)',
      height: 'clamp(60px, 8vw, 70px)',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(1.5rem, 4vw, 1.8rem)',
      fontWeight: 'bold',
      margin: '0 auto 1.5rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
    },
    stepTitle: {
      fontSize: '1.2rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#2c3e50',
    },
    stepText: {
      color: '#6c757d',
      lineHeight: 1.6,
      margin: 0,
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 0',
      borderRadius: '30px',
      margin: '40px 0',
      position: 'relative',
      overflow: 'hidden',
    },
    ctaButton: {
      padding: '14px 40px',
      fontSize: '1.1rem',
      fontWeight: 600,
      borderRadius: '50px',
      background: 'white',
      color: '#667eea',
      border: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
  };

  // Touch feedback handler
  const handleTouchStart = (e) => {
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.style.transform = '';
  };

  // Hover handlers for feature cards
  const handleFeatureHover = (e) => {
    const card = e.currentTarget;
    const iconWrapper = card.querySelector('.feature-icon-wrapper');
    const icon = card.querySelector('.feature-icon');
    const title = card.querySelector('.feature-title');
    
    card.style.transform = 'translateY(-10px)';
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
    
    if (iconWrapper) {
      iconWrapper.style.transform = 'scale(1.1)';
      iconWrapper.style.background = 'linear-gradient(135deg, #667eea40, #764ba240)';
    }
    
    if (icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
    }
    
    if (title) {
      title.style.color = '#667eea';
    }
  };

  const handleFeatureLeave = (e) => {
    const card = e.currentTarget;
    const iconWrapper = card.querySelector('.feature-icon-wrapper');
    const icon = card.querySelector('.feature-icon');
    const title = card.querySelector('.feature-title');
    
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
    
    if (iconWrapper) {
      iconWrapper.style.transform = 'scale(1)';
      iconWrapper.style.background = 'linear-gradient(135deg, #667eea20, #764ba220)';
    }
    
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0)';
    }
    
    if (title) {
      title.style.color = '#2c3e50';
    }
  };

  // Hover handlers for step cards
  const handleStepHover = (e) => {
    const card = e.currentTarget;
    const stepNumber = card.querySelector('.step-number');
    const title = card.querySelector('.step-title');
    
    card.style.transform = 'translateY(-10px)';
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
    
    if (stepNumber) {
      stepNumber.style.transform = 'scale(1.1)';
      stepNumber.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
    }
    
    if (title) {
      title.style.color = '#667eea';
    }
  };

  const handleStepLeave = (e) => {
    const card = e.currentTarget;
    const stepNumber = card.querySelector('.step-number');
    const title = card.querySelector('.step-title');
    
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
    
    if (stepNumber) {
      stepNumber.style.transform = 'scale(1)';
      stepNumber.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
    }
    
    if (title) {
      title.style.color = '#2c3e50';
    }
  };

  return (
    <div className="homepage-android-optimized smooth-scroll">
      {/* Hero Section */}
      <section style={styles.heroSection} className="hero-section">
        <div style={styles.heroOverlay}></div>
        <div className="container">
          <h1 style={styles.heroTitle}>
            Rent High-Quality Laptops
          </h1>
          <p style={styles.heroText}>
            Get the latest laptops for work, gaming, or creative projects. 
            Flexible rental periods and competitive prices.
          </p>
          <Link 
            to="/browse" 
            style={styles.heroButton}
            className="clickable-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            Browse Laptops
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5 animate-on-scroll">
            <div className="col-md-12">
              <h2 style={styles.sectionTitle}>Why Choose Quick Tech Rent?</h2>
              <p style={styles.sectionSubtitle}>We make laptop rental simple and affordable</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-4 animate-on-scroll">
              <div 
                style={styles.featureCard}
                className="feature-card clickable-card"
                onMouseEnter={handleFeatureHover}
                onMouseLeave={handleFeatureLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="feature-icon-wrapper" style={styles.featureIconWrapper}>
                  <i className="fas fa-laptop feature-icon" style={styles.featureIcon}></i>
                </div>
                <h4 className="feature-title" style={styles.featureTitle}>Latest Models</h4>
                <p style={styles.featureText}>
                  Access the newest laptop models from top brands like Apple, Dell, HP, and more.
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4 animate-on-scroll">
              <div 
                style={styles.featureCard}
                className="feature-card clickable-card"
                onMouseEnter={handleFeatureHover}
                onMouseLeave={handleFeatureLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="feature-icon-wrapper" style={styles.featureIconWrapper}>
                  <i className="fas fa-shipping-fast feature-icon" style={styles.featureIcon}></i>
                </div>
                <h4 className="feature-title" style={styles.featureTitle}>Fast Delivery</h4>
                <p style={styles.featureText}>
                  Get your laptop delivered to your doorstep within 24 hours in most locations.
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4 animate-on-scroll">
              <div 
                style={styles.featureCard}
                className="feature-card clickable-card"
                onMouseEnter={handleFeatureHover}
                onMouseLeave={handleFeatureLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="feature-icon-wrapper" style={styles.featureIconWrapper}>
                  <i className="fas fa-headset feature-icon" style={styles.featureIcon}></i>
                </div>
                <h4 className="feature-title" style={styles.featureTitle}>24/7 Support</h4>
                <p style={styles.featureText}>
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
          <div className="row mb-5 animate-on-scroll">
            <div className="col-md-12 text-center">
              <h2 style={styles.sectionTitle}>Featured Laptops</h2>
              <p style={styles.sectionSubtitle}>Check out our most popular rental options</p>
            </div>
          </div>
          <div className="row justify-content-center">
            {featuredDevices.map((device, index) => (
              <div 
                key={device.id} 
                className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4 animate-on-scroll"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DeviceCard 
                  device={device} 
                  addToCart={addToCart}
                />
              </div>
            ))}
          </div>
          <div className="row mt-4">
            <div className="col-md-12 text-center">
              <Link 
                to="/browse" 
                className="btn btn-primary btn-lg"
                style={{
                  padding: '12px 32px',
                  borderRadius: '50px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                View All Laptops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-5 animate-on-scroll">
            <div className="col-md-12 text-center">
              <h2 style={styles.sectionTitle}>How It Works</h2>
              <p style={styles.sectionSubtitle}>Renting a laptop has never been easier</p>
            </div>
          </div>
          <div className="row">
            {[
              { number: 1, title: 'Browse & Select', text: 'Choose from our wide selection of laptops based on your needs and budget.', icon: 'fa-search' },
              { number: 2, title: 'Add to Cart', text: 'Select your rental duration and add the laptop to your cart.', icon: 'fa-shopping-cart' },
              { number: 3, title: 'Checkout', text: 'Provide your delivery address and complete your order securely.', icon: 'fa-credit-card' },
              { number: 4, title: 'Enjoy', text: 'Receive your laptop and use it for your project, work, or studies.', icon: 'fa-smile' }
            ].map((step, index) => (
              <div key={step.number} className="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-4 animate-on-scroll">
                <div 
                  style={styles.stepCard}
                  className="step-card clickable-card"
                  onMouseEnter={handleStepHover}
                  onMouseLeave={handleStepLeave}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="step-number" style={styles.stepNumber}>
                    {step.number}
                  </div>
                  <h4 className="step-title" style={styles.stepTitle}>{step.title}</h4>
                  <p style={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mb-5 animate-on-scroll">
        <div style={styles.ctaSection}>
          <div className="container text-center py-4">
            <h3 className="text-white mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              Ready to get started?
            </h3>
            <p className="text-white opacity-75 mb-4" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
              Join thousands of satisfied customers who trust Quick Tech Rent
            </p>
            <Link 
              to="/browse" 
              style={styles.ctaButton}
              className="clickable-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              Browse Available Laptops
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;