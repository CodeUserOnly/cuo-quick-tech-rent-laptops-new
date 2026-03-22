import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Add Android-specific optimizations
  React.useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
      
      /* Android & Mobile Optimizations */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
      
      .footer-android-optimized {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        will-change: transform;
      }
      
      /* Better touch targets for Android */
      .footer-clickable {
        min-height: 48px;
        min-width: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        -webkit-tap-highlight-color: transparent;
      }
      
      .footer-link-clickable {
        min-height: 44px;
        display: flex;
        align-items: center;
        padding: 8px 0;
      }
      
      /* Smooth scrolling for Android */
      .footer-container {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Prevent text resize on orientation change */
      @media screen and (max-width: 768px) {
        html {
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        
        /* Desktop styles - left aligned */
        .footer-section {
          text-align: left !important;
        }
        
        .footer-section-title {
          text-align: left !important;
        }
        
        .footer-section-title::after {
          left: 0 !important;
          transform: none !important;
        }
        
        .footer-social-links {
          justify-content: flex-start !important;
        }
        
        .footer-link {
          justify-content: flex-start !important;
        }
        
        .footer-contact-item {
          justify-content: flex-start !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          text-align: left !important;
        }
        
        .footer-grid {
          gap: 2rem !important;
        }
      }
      
      /* Android specific adjustments */
      @media (max-width: 768px) {
        .footer-section,
        .footer-link,
        .social-icon,
        .contact-item {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      }
      
      /* Better touch feedback for Android */
      .footer-clickable:active {
        opacity: 0.7;
        transform: scale(0.98);
        transition: all 0.05s ease;
      }
      
      /* Prevent flash of white on tap */
      .footer-link:active,
      .social-icon:active,
      .legal-link:active,
      .contact-value:active {
        background-color: rgba(59, 130, 246, 0.1);
      }
      
      /* Optimize for different Android screen densities */
      @media only screen and (-webkit-min-device-pixel-ratio: 1.5),
             only screen and (min-resolution: 144dpi) {
        .brand-title {
          -webkit-font-smoothing: antialiased;
          font-smoothing: antialiased;
        }
      }
      
      /* Reduce motion if user prefers */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const styles = {
    footer: {
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1422 100%)',
      position: 'relative',
      marginTop: 'auto',
      overflow: 'hidden',
      // Android optimizations
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
      willChange: 'transform',
    },
    wave: {
      position: 'absolute',
      top: '-1px',
      left: 0,
      width: '100%',
      overflow: 'hidden',
      lineHeight: 0,
    },
    waveSvg: {
      position: 'relative',
      display: 'block',
      width: 'calc(100% + 1.3px)',
      height: '60px',
      // Android optimization
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
    },
    footerContent: {
      position: 'relative',
      padding: '4rem 0 2rem',
      zIndex: 1,
      // Android optimization
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 2rem',
      // Android smooth scrolling
      WebkitOverflowScrolling: 'touch',
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2.5rem',
      marginBottom: '3rem',
    },
    footerSection: {
      animation: 'fadeInUp 0.6s ease-out',
      textAlign: 'left', // Left align for desktop
      // Android optimization
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
    },
    brandWrapper: {
      marginBottom: '1.25rem',
    },
    brandTitle: {
      fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: 0,
      // Android font smoothing
      WebkitFontSmoothing: 'antialiased',
      fontSmoothing: 'antialiased',
    },
    badge: {
      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      color: 'white',
      fontSize: 'clamp(0.65rem, 3vw, 0.7rem)',
      fontWeight: 600,
      padding: '0.25rem 0.6rem',
      borderRadius: '20px',
      letterSpacing: '0.5px',
      animation: 'pulse 2s infinite',
      whiteSpace: 'nowrap',
    },
    description: {
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 1.6,
      marginBottom: '1.5rem',
      fontSize: 'clamp(0.85rem, 3.5vw, 0.9rem)',
      textAlign: 'left', // Left aligned text
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-start', // Left aligned for desktop
    },
    socialIcon: {
      width: 'clamp(38px, 8vw, 44px)',
      height: 'clamp(38px, 8vw, 44px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '50%',
      color: 'rgba(255, 255, 255, 0.7)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textDecoration: 'none',
      fontSize: 'clamp(0.9rem, 4vw, 1rem)',
      cursor: 'pointer',
      border: 'none',
      // Android touch optimization
      minWidth: '44px',
      minHeight: '44px',
      WebkitTapHighlightColor: 'transparent',
    },
    sectionTitle: {
      color: 'white',
      fontSize: 'clamp(1rem, 4vw, 1.1rem)',
      fontWeight: 600,
      marginBottom: '1.25rem',
      position: 'relative',
      paddingBottom: '0.75rem',
      letterSpacing: '0.5px',
      textAlign: 'left', // Left aligned title
    },
    sectionTitleAfter: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0, // Left aligned underline
      width: '40px',
      height: '2px',
      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
      borderRadius: '2px',
      transition: 'width 0.3s ease',
    },
    footerLinks: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    footerLinkItem: {
      marginBottom: '0.75rem',
    },
    footerLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'rgba(255, 255, 255, 0.7)',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: 'clamp(0.85rem, 3.5vw, 0.9rem)',
      // Android touch optimization
      minHeight: '44px',
      padding: '8px 0',
      WebkitTapHighlightColor: 'transparent',
      justifyContent: 'flex-start', // Left aligned links
    },
    footerLinkIcon: {
      width: '20px',
      fontSize: 'clamp(0.8rem, 3.5vw, 0.85rem)',
      transition: 'transform 0.3s ease',
      flexShrink: 0,
    },
    contactInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    contactItem: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
      justifyContent: 'flex-start', // Left aligned contact items
      // Android optimization
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
    },
    contactIcon: {
      width: 'clamp(35px, 7vw, 40px)',
      height: 'clamp(35px, 7vw, 40px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '10px',
      color: '#3b82f6',
      fontSize: 'clamp(0.9rem, 4vw, 1rem)',
      transition: 'all 0.3s ease',
      flexShrink: 0,
    },
    contactDetails: {
      flex: 1,
      textAlign: 'left', // Left aligned text
    },
    contactLabel: {
      display: 'block',
      fontSize: 'clamp(0.65rem, 3vw, 0.7rem)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: 'rgba(255, 255, 255, 0.5)',
      marginBottom: '0.25rem',
      textAlign: 'left', // Left aligned label
    },
    contactValue: {
      color: 'rgba(255, 255, 255, 0.8)',
      textDecoration: 'none',
      fontSize: 'clamp(0.85rem, 3.5vw, 0.9rem)',
      lineHeight: 1.5,
      transition: 'color 0.3s ease',
      display: 'inline-block',
      textAlign: 'left', // Left aligned value
      // Android touch optimization
      minHeight: '44px',
      padding: '4px 0',
      WebkitTapHighlightColor: 'transparent',
    },
    footerBottom: {
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '2rem',
      marginTop: '1rem',
    },
    footerBottomContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    copyright: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 'clamp(0.75rem, 3vw, 0.85rem)',
      margin: 0,
      textAlign: 'left', // Left aligned
    },
    footerLegal: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    legalLink: {
      color: 'rgba(255, 255, 255, 0.5)',
      textDecoration: 'none',
      fontSize: 'clamp(0.75rem, 3vw, 0.85rem)',
      transition: 'color 0.3s ease',
      // Android touch optimization
      minHeight: '44px',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 0',
      WebkitTapHighlightColor: 'transparent',
    },
    separator: {
      color: 'rgba(255, 255, 255, 0.3)',
      fontSize: 'clamp(0.7rem, 3vw, 0.75rem)',
    },
  };

  // Touch feedback handler for Android
  const handleTouchStart = (e) => {
    e.currentTarget.style.opacity = '0.7';
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.style.opacity = '';
  };

  return (
    <footer style={styles.footer} className="footer-android-optimized">
      {/* Wave Decoration */}
      <div style={styles.wave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" style={styles.waveSvg}>
          <path fill="rgba(255,255,255,0.05)" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>
      
      <div style={styles.footerContent}>
        <div style={styles.container} className="footer-container">
          <div style={styles.footerGrid} className="footer-grid">
            {/* Company Info */}
            <div style={styles.footerSection} className="footer-section">
              <div style={styles.brandWrapper}>
                <h3 style={styles.brandTitle}>
                  Quick Tech Rent
                  <span style={styles.badge}>ALPHA</span>
                </h3>
              </div>
              <p style={styles.description}>
                Your trusted partner for premium laptop rentals. We provide high-quality laptops 
                for professionals, students, and businesses with flexible rental options.
              </p>
              <div style={styles.socialLinks} className="footer-social-links">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.socialIcon}
                  className="footer-social-icon footer-clickable"
                  aria-label="Facebook"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.socialIcon}
                  className="footer-social-icon footer-clickable"
                  aria-label="Twitter"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.socialIcon}
                  className="footer-social-icon footer-clickable"
                  aria-label="LinkedIn"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.socialIcon}
                  className="footer-social-icon footer-clickable"
                  aria-label="Instagram"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div style={styles.footerSection} className="footer-section">
              <h4 style={styles.sectionTitle} className="footer-section-title">
                Quick Links
                <span style={styles.sectionTitleAfter}></span>
              </h4>
              <ul style={styles.footerLinks}>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-home" style={styles.footerLinkIcon}></i>
                    <span>Home</span>
                  </Link>
                </li>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/browse" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-laptop" style={styles.footerLinkIcon}></i>
                    <span>Browse Laptops</span>
                  </Link>
                </li>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/support" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-headset" style={styles.footerLinkIcon}></i>
                    <span>Support</span>
                  </Link>
                </li>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/about" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-info-circle" style={styles.footerLinkIcon}></i>
                    <span>About Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div style={styles.footerSection} className="footer-section">
              <h4 style={styles.sectionTitle} className="footer-section-title">
                Customer Service
                <span style={styles.sectionTitleAfter}></span>
              </h4>
              <ul style={styles.footerLinks}>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/contact" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-envelope" style={styles.footerLinkIcon}></i>
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/faq" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-question-circle" style={styles.footerLinkIcon}></i>
                    <span>FAQs</span>
                  </Link>
                </li>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/shipping" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-shipping-fast" style={styles.footerLinkIcon}></i>
                    <span>Shipping Policy</span>
                  </Link>
                </li>
                <li style={styles.footerLinkItem}>
                  <Link 
                    to="/returns" 
                    style={styles.footerLink}
                    className="footer-link footer-link-clickable footer-clickable"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        const icon = e.currentTarget.querySelector('i');
                        if (icon) icon.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      const icon = e.currentTarget.querySelector('i');
                      if (icon) icon.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="fas fa-undo" style={styles.footerLinkIcon}></i>
                    <span>Return Policy</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div style={styles.footerSection} className="footer-section">
              <h4 style={styles.sectionTitle} className="footer-section-title">
                Get in Touch
                <span style={styles.sectionTitleAfter}></span>
              </h4>
              <div style={styles.contactInfo}>
                <div style={styles.contactItem} className="footer-contact-item">
                  <div style={styles.contactIcon}>
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div style={styles.contactDetails}>
                    <span style={styles.contactLabel}>EMAIL</span>
                    <a 
                      href="mailto:quicktechrent@gmail.com" 
                      style={styles.contactValue}
                      className="footer-clickable"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onMouseEnter={(e) => {
                        if (window.matchMedia('(hover: hover)').matches) {
                          e.currentTarget.style.color = '#3b82f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      }}
                    >
                      quicktechrent@gmail.com
                    </a>
                  </div>
                </div>
                
                <div style={styles.contactItem} className="footer-contact-item">
                  <div style={styles.contactIcon}>
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div style={styles.contactDetails}>
                    <span style={styles.contactLabel}>PHONE</span>
                    <a 
                      href="tel:+919769602148" 
                      style={styles.contactValue}
                      className="footer-clickable"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onMouseEnter={(e) => {
                        if (window.matchMedia('(hover: hover)').matches) {
                          e.currentTarget.style.color = '#3b82f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      }}
                    >
                      +91 9769602148
                    </a>
                  </div>
                </div>
                
                <div style={styles.contactItem} className="footer-contact-item">
                  <div style={styles.contactIcon}>
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div style={styles.contactDetails}>
                    <span style={styles.contactLabel}>ADDRESS</span>
                    <span style={styles.contactValue}>
                      123 Tech Street<br />
                      Silicon Valley, Mumbai 400042
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={styles.footerBottom}>
            <div style={styles.footerBottomContent}>
              <p style={styles.copyright}>
                © {currentYear} Quick Tech Rent. All rights reserved.
              </p>
              <div style={styles.footerLegal}>
                <Link 
                  to="/privacy" 
                  style={styles.legalLink}
                  className="footer-clickable"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.color = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  Privacy Policy
                </Link>
                <span style={styles.separator}>|</span>
                <Link 
                  to="/terms" 
                  style={styles.legalLink}
                  className="footer-clickable"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.color = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;