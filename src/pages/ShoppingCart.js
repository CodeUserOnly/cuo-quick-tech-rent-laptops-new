import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ShoppingCart = ({ cart, updateCartItemDuration, removeFromCart, user }) => {
  const navigate = useNavigate();
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const days = item.rentalDuration || 1;
    return sum + (item.price * days);
  }, 0);
  
  const tax = subtotal * 0.1;
  const deliveryFee = subtotal > 5000 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  // Handle duration change
  const handleDurationChange = async (itemId, value) => {
    const days = parseInt(value);
    if (days >= 1 && days <= 30 && !updatingItem) {
      setUpdatingItem(itemId);
      await updateCartItemDuration(itemId, days);
      setTimeout(() => setUpdatingItem(null), 300);
    }
  };

  // Handle remove
  const handleRemoveFromCart = async (itemId) => {
    setRemovingItem(itemId);
    setTimeout(async () => {
      await removeFromCart(itemId);
      setRemovingItem(null);
    }, 300);
  };

  // Handle checkout with authentication check
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items to proceed.');
      return;
    }
    
    const invalidItems = cart.filter(item => 
      !item.rentalDuration || item.rentalDuration < 1 || item.rentalDuration > 30
    );
    
    if (invalidItems.length > 0) {
      alert('Please set valid rental duration (1-30 days) for all items.');
      return;
    }

    // Check if user is logged in
    let isLoggedIn = false;
    
    if (user) {
      if (user.isAuthenticated === true ||
          user.isLoggedIn === true ||
          (user.id && user.id !== null && user.id !== '') ||
          (user._id && user._id !== null && user._id !== '') ||
          (user.email && user.email !== null && user.email !== '') ||
          (user.token && user.token !== null && user.token !== '')) {
        isLoggedIn = true;
      }
    }
    
    if (!isLoggedIn) {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    sessionStorage.getItem('token') ||
                    sessionStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token || storedUser) {
        isLoggedIn = true;
      }
    }
    
    if (isLoggedIn) {
      navigate('/checkout');
      return;
    }
    
    setShowLoginPrompt(true);
  };

  const handleLogin = () => {
    setShowLoginPrompt(false);
    sessionStorage.setItem('redirectAfterLogin', '/checkout');
    navigate('/login');
  };

  const handleGuestCheckout = () => {
    setShowLoginPrompt(false);
    navigate('/checkout?guest=true');
  };

  // Generate a unique key for each cart item
  // This is the key fix - using cartItemId if available, or combining id with rentalDuration
  const getUniqueKey = (item) => {
    // If the item has a unique cartItemId, use that
    if (item.cartItemId) return item.cartItemId;
    // Otherwise combine id with rentalDuration to create unique key
    // This ensures that even if same device is added multiple times with different durations, they have unique keys
    return `${item.id}_${item.rentalDuration || 1}_${item.addedAt || Date.now()}`;
  };

  // Add styles to document (moved to useEffect to avoid duplicate styles)
  useEffect(() => {
    const styleId = 'cart-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        * {
          -webkit-tap-highlight-color: transparent;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .items-summary-scroll::-webkit-scrollbar {
          width: 3px;
        }
        
        .items-summary-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .items-summary-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }

        input[type="number"] {
          font-size: 16px;
        }

        .cart-container {
          -webkit-overflow-scrolling: touch;
        }

        .touch-feedback:active {
          transform: scale(0.97);
          transition: transform 0.1s ease;
        }

        .empty-cart-svg {
          animation: float 3s ease-in-out infinite;
        }

        .login-prompt-modal {
          animation: fadeIn 0.3s ease-out;
        }

        .login-prompt-content {
          animation: slideInUp 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) document.head.removeChild(style);
    };
  }, []);

  // Mobile-specific styles
  const mobileStyles = {
    container: {
      maxWidth: '100%',
      margin: 0,
      padding: '16px',
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    header: {
      marginBottom: '20px',
      padding: '0 4px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '4px'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '14px',
      margin: 0
    },
    grid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    cartItem: (isRemoving, isUpdating) => ({
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'fadeInUp 0.4s ease-out',
      overflow: 'hidden',
      opacity: isRemoving ? 0 : 1,
      transform: isRemoving ? 'translateX(100%)' : isUpdating ? 'scale(0.98)' : 'translateX(0)',
      pointerEvents: isUpdating ? 'none' : 'auto'
    }),
    cartItemContent: {
      padding: '16px'
    },
    itemImage: {
      width: '100%',
      height: '160px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#f8f9fa',
      marginBottom: '12px'
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    itemDetails: {
      marginBottom: '12px'
    },
    itemName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#2d3748',
      margin: '0 0 4px 0',
      lineHeight: '1.3'
    },
    itemBrand: {
      fontSize: '13px',
      color: '#718096',
      margin: '0 0 8px 0'
    },
    itemSpecs: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '8px'
    },
    specBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '11px',
      color: '#4a5568',
      background: '#edf2f7',
      padding: '4px 8px',
      borderRadius: '6px'
    },
    priceBadge: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '2px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '4px 12px',
      borderRadius: '20px',
      color: 'white',
      marginTop: '8px'
    },
    priceTag: {
      fontSize: '16px',
      fontWeight: '700'
    },
    priceUnit: {
      fontSize: '11px',
      opacity: 0.9
    },
    itemActions: {
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid #e2e8f0'
    },
    durationControl: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    durationLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#4a5568'
    },
    durationInputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: '#f7fafc',
      borderRadius: '12px',
      padding: '4px'
    },
    durationBtn: {
      width: '40px',
      height: '40px',
      border: 'none',
      background: 'white',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      color: '#4a5568',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    durationInput: {
      width: '50px',
      textAlign: 'center',
      border: 'none',
      background: 'transparent',
      fontWeight: '600',
      fontSize: '16px',
      padding: '8px 0'
    },
    durationTotal: {
      fontSize: '13px',
      color: '#667eea',
      fontWeight: '600'
    },
    removeBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      width: '100%',
      padding: '12px',
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      color: '#e53e3e',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: '500'
    },
    continueShopping: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500',
      marginTop: '8px',
      padding: '12px',
      background: 'white',
      borderRadius: '12px',
      textAlign: 'center'
    },
    summaryCard: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      position: 'sticky',
      top: '16px'
    },
    summaryHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'white'
    },
    summaryHeaderTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600'
    },
    summaryContent: {
      padding: '16px'
    },
    itemsCount: {
      marginBottom: '12px'
    },
    countBadge: {
      display: 'inline-block',
      background: '#edf2f7',
      color: '#4a5568',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500'
    },
    itemsSummary: {
      marginBottom: '12px',
      maxHeight: '200px',
      overflowY: 'auto'
    },
    summaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '13px',
      color: '#4a5568'
    },
    summaryItemName: {
      flex: 1,
      marginRight: '8px'
    },
    itemDuration: {
      fontSize: '11px',
      color: '#a0aec0',
      marginLeft: '4px'
    },
    summaryItemPrice: {
      fontWeight: '500',
      color: '#2d3748'
    },
    priceBreakdown: {
      marginBottom: '12px'
    },
    breakdownRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: '13px',
      color: '#4a5568'
    },
    freeDelivery: {
      color: '#48bb78',
      fontWeight: '500'
    },
    deliveryInfo: {
      marginTop: '8px',
      padding: '8px',
      background: '#ebf8ff',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      color: '#3182ce'
    },
    divider: {
      height: '1px',
      background: '#e2e8f0',
      margin: '12px 0'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '16px'
    },
    totalLabel: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#2d3748'
    },
    totalPrice: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#667eea'
    },
    actionButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '12px'
    },
    checkoutBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '16px'
    },
    browseBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px',
      background: 'white',
      color: '#4a5568',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      textAlign: 'center'
    },
    secureBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      paddingTop: '12px',
      fontSize: '11px',
      color: '#a0aec0',
      borderTop: '1px solid #e2e8f0'
    },
    emptyContainer: {
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    emptyContent: {
      textAlign: 'center',
      width: '100%',
      maxWidth: '300px',
      margin: '0 auto'
    },
    emptySvgWrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px'
    },
    emptySvg: {
      width: '120px',
      height: '120px',
      color: '#cbd5e0'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '8px',
      textAlign: 'center'
    },
    emptyText: {
      fontSize: '14px',
      color: '#718096',
      marginBottom: '24px',
      textAlign: 'center'
    },
    browsePrimaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      border: 'none',
      cursor: 'pointer'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      maxWidth: '400px',
      width: '100%',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      textAlign: 'center',
      color: 'white'
    },
    modalIcon: {
      width: '60px',
      height: '60px',
      margin: '0 auto 12px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '700',
      margin: '0 0 8px 0'
    },
    modalSubtitle: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0
    },
    modalBody: {
      padding: '24px'
    },
    modalText: {
      color: '#4a5568',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '20px',
      textAlign: 'center'
    },
    modalButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    loginBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    guestBtn: {
      width: '100%',
      padding: '14px',
      background: 'white',
      color: '#4a5568',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    closeBtn: {
      marginTop: '12px',
      padding: '10px',
      background: 'transparent',
      color: '#a0aec0',
      border: 'none',
      fontSize: '13px',
      cursor: 'pointer',
      textAlign: 'center'
    }
  };

  // Desktop styles
  const desktopStyles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 360px',
      gap: '24px'
    },
    cartItem: (isRemoving, isUpdating) => ({
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'fadeInUp 0.5s ease-out',
      overflow: 'hidden',
      opacity: isRemoving ? 0 : 1,
      transform: isRemoving ? 'translateX(100%)' : isUpdating ? 'scale(0.98)' : 'translateX(0)',
      pointerEvents: isUpdating ? 'none' : 'auto'
    }),
    cartItemContent: {
      display: 'flex',
      padding: '20px',
      gap: '20px'
    },
    itemImage: {
      flexShrink: 0,
      width: '120px',
      height: '120px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#f8f9fa'
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    itemDetails: {
      flex: 1
    },
    itemName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2d3748',
      margin: '0 0 4px 0'
    },
    itemBrand: {
      fontSize: '14px',
      color: '#718096',
      margin: '0 0 12px 0'
    },
    itemSpecs: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '12px'
    },
    specBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: '#4a5568',
      background: '#edf2f7',
      padding: '4px 8px',
      borderRadius: '6px'
    },
    priceBadge: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '4px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '4px 12px',
      borderRadius: '20px',
      color: 'white'
    },
    priceTag: {
      fontSize: '16px',
      fontWeight: '700'
    },
    priceUnit: {
      fontSize: '12px',
      opacity: 0.9
    },
    itemActions: {
      flexShrink: 0,
      width: '180px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    durationControl: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    durationLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#4a5568',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    durationInputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#f7fafc',
      borderRadius: '12px',
      padding: '4px'
    },
    durationBtn: {
      width: '36px',
      height: '36px',
      border: 'none',
      background: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      color: '#4a5568'
    },
    durationInput: {
      width: '60px',
      textAlign: 'center',
      border: 'none',
      background: 'transparent',
      fontWeight: '600',
      fontSize: '16px',
      padding: '8px 0'
    },
    durationTotal: {
      fontSize: '14px',
      color: '#667eea',
      textAlign: 'center',
      fontWeight: '500'
    },
    removeBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '8px',
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#e53e3e',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    continueShopping: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500',
      marginTop: '16px',
      transition: 'all 0.2s ease',
      width: 'fit-content'
    },
    summaryCard: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      position: 'sticky',
      top: '100px'
    },
    summaryHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white'
    },
    summaryHeaderTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600'
    },
    summaryContent: {
      padding: '20px'
    },
    itemsCount: {
      marginBottom: '20px'
    },
    countBadge: {
      display: 'inline-block',
      background: '#edf2f7',
      color: '#4a5568',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    itemsSummary: {
      marginBottom: '20px',
      maxHeight: '250px',
      overflowY: 'auto'
    },
    summaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '14px',
      color: '#4a5568'
    },
    summaryItemName: {
      flex: 1,
      marginRight: '12px'
    },
    itemDuration: {
      fontSize: '12px',
      color: '#a0aec0',
      marginLeft: '4px'
    },
    summaryItemPrice: {
      fontWeight: '500',
      color: '#2d3748'
    },
    priceBreakdown: {
      marginBottom: '20px'
    },
    breakdownRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '14px',
      color: '#4a5568'
    },
    freeDelivery: {
      color: '#48bb78',
      fontWeight: '500'
    },
    deliveryInfo: {
      marginTop: '12px',
      padding: '12px',
      background: '#ebf8ff',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: '#3182ce'
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
      margin: '16px 0'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '20px'
    },
    totalLabel: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#2d3748'
    },
    totalPrice: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#667eea'
    },
    actionButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '16px'
    },
    checkoutBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '16px'
    },
    browseBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px',
      background: 'white',
      color: '#4a5568',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px'
    },
    secureBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      paddingTop: '16px',
      fontSize: '12px',
      color: '#a0aec0',
      borderTop: '1px solid #e2e8f0'
    },
    emptyContainer: {
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    },
    emptyContent: {
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    },
    emptySvgWrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    emptySvg: {
      width: '160px',
      height: '160px',
      color: '#cbd5e0'
    },
    emptyTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '12px',
      textAlign: 'center'
    },
    emptyText: {
      fontSize: '16px',
      color: '#718096',
      marginBottom: '32px',
      textAlign: 'center'
    },
    browsePrimaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '14px 32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      border: 'none',
      cursor: 'pointer'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      maxWidth: '450px',
      width: '100%',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      textAlign: 'center',
      color: 'white'
    },
    modalIcon: {
      width: '70px',
      height: '70px',
      margin: '0 auto 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0 0 8px 0'
    },
    modalSubtitle: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0
    },
    modalBody: {
      padding: '32px'
    },
    modalText: {
      color: '#4a5568',
      fontSize: '16px',
      lineHeight: '1.5',
      marginBottom: '24px',
      textAlign: 'center'
    },
    modalButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    loginBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    guestBtn: {
      width: '100%',
      padding: '14px',
      background: 'white',
      color: '#4a5568',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    closeBtn: {
      marginTop: '16px',
      padding: '10px',
      background: 'transparent',
      color: '#a0aec0',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'center'
    }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;

  // Empty Cart SVG Component
  const EmptyCartSVG = () => (
    <svg 
      className="empty-cart-svg"
      style={styles.emptySvg}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M17 16.5C17 17.9 15.9 19 14.5 19H10.5C9.1 19 8 17.9 8 16.5M17 16.5H8M14.5 22C15.3 22 16 21.3 16 20.5C16 19.7 15.3 19 14.5 19C13.7 19 13 19.7 13 20.5C13 21.3 13.7 22 14.5 22ZM9.5 22C10.3 22 11 21.3 11 20.5C11 19.7 10.3 19 9.5 19C8.7 19 8 19.7 8 20.5C8 21.3 8.7 22 9.5 22Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle 
        cx="18" 
        cy="6" 
        r="2" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
    </svg>
  );

  // Login Prompt Modal Component
  const LoginPromptModal = () => (
    <div style={styles.modalOverlay} className="login-prompt-modal" onClick={() => setShowLoginPrompt(false)}>
      <div style={styles.modalContent} className="login-prompt-content" onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2ZM12 12V21.5M12 12L3 7M12 12L21 7M12 21.5L3 16.5V9.5M12 21.5L21 16.5V9.5" stroke="white" strokeWidth="1.5"/>
              <path d="M16 12L12 14L8 12M12 14V18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 style={styles.modalTitle}>Login Required</h3>
          <p style={styles.modalSubtitle}>To complete your purchase</p>
        </div>
        <div style={styles.modalBody}>
          <p style={styles.modalText}>
            Please login to your account to proceed with checkout. 
            You'll be able to complete your rental order and track your shipments.
          </p>
          <div style={styles.modalButtons}>
            <button style={styles.loginBtn} onClick={handleLogin} className="touch-feedback">
              Login to Account
            </button>
            <button style={styles.guestBtn} onClick={handleGuestCheckout} className="touch-feedback">
              Continue as Guest
            </button>
            <button style={styles.closeBtn} onClick={() => setShowLoginPrompt(false)} className="touch-feedback">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render SVG icons
  const Icon = ({ name, size = 20, color = 'currentColor' }) => {
    const icons = {
      search: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      cart: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M17 16.5C17 17.9 15.9 19 14.5 19H10.5C9.1 19 8 17.9 8 16.5M17 16.5H8M14.5 22C15.3 22 16 21.3 16 20.5C16 19.7 15.3 19 14.5 19C13.7 19 13 19.7 13 20.5C13 21.3 13.7 22 14.5 22ZM9.5 22C10.3 22 11 21.3 11 20.5C11 19.7 10.3 19 9.5 19C8.7 19 8 19.7 8 20.5C8 21.3 8.7 22 9.5 22Z" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      minus: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      plus: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      trash: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7H20M10 11V16M14 11V16M5 7L6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19L19 7M9 7H15M9 7V4C9 3.4 9.4 3 10 3H14C14.6 3 15 3.4 15 4V7" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      arrowLeft: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      arrowRight: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M12 5L19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      receipt: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 7H15M9 12H12M12 17H15M3 5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5Z" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      lock: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7L12 12L21 7L12 2ZM12 12V21.5M12 12L3 7M12 12L21 7M12 21.5L3 16.5V9.5M12 21.5L21 16.5V9.5" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      info: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L15 15M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      cpu: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12V8H4V12M20 12L4 12M20 12L16 16M4 12L8 16" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      memory: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V12L16 14M12 22C7.28595 22 3.5 18.5 3.5 14C3.5 9.5 7.5 5 12 2C16.5 5 20.5 9.5 20.5 14C20.5 18.5 16.714 22 12 22Z" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      storage: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20M8 8H16M12 12V20M12 20L9 17M12 20L15 17" stroke={color} strokeWidth="1.5"/>
        </svg>
      )
    };
    return icons[name] || null;
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyContent}>
            <div style={styles.emptySvgWrapper}>
              <EmptyCartSVG />
            </div>
            <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
            <p style={styles.emptyText}>Looks like you haven't added any laptops to your cart yet.</p>
            <Link to="/browse" style={styles.browsePrimaryBtn} className="touch-feedback">
              <Icon name="search" size={isMobile ? 18 : 20} />
              Browse Laptops
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="cart-container">
      {/* Login Prompt Modal */}
      {showLoginPrompt && <LoginPromptModal />}

      <div style={styles.header}>
        <h1 style={styles.title}>Shopping Cart</h1>
        <p style={styles.subtitle}>Review and adjust your rental selections</p>
      </div>

      <div style={styles.grid}>
        {/* Cart Items Column */}
        <div>
          {cart.map((item) => (
            <div 
              key={getUniqueKey(item)} 
              style={styles.cartItem(removingItem === item.id, updatingItem === item.id)}
            >
              <div style={styles.cartItemContent}>
                {/* Product Image */}
                <div style={styles.itemImage}>
                  <img 
                    src={item.image || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    style={styles.img}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                
                {/* Product Details */}
                <div style={styles.itemDetails}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemBrand}>{item.brand}</p>
                  
                  {/* Specifications */}
                  <div style={styles.itemSpecs}>
                    <span style={styles.specBadge}>
                      <Icon name="cpu" size={12} />
                      {item.specs?.processor || 'N/A'}
                    </span>
                    <span style={styles.specBadge}>
                      <Icon name="memory" size={12} />
                      {item.specs?.ram || 'N/A'}
                    </span>
                    <span style={styles.specBadge}>
                      <Icon name="storage" size={12} />
                      {item.specs?.storage || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Price per day */}
                  <div style={styles.priceBadge}>
                    <span style={styles.priceTag}>₹{item.price}</span>
                    <span style={styles.priceUnit}>/day</span>
                  </div>
                </div>
                
                {/* Duration and Actions */}
                <div style={styles.itemActions}>
                  {/* Rental Duration Input */}
                  <div style={styles.durationControl}>
                    <span style={styles.durationLabel}>Rental Days</span>
                    <div style={styles.durationInputGroup}>
                      <button 
                        style={styles.durationBtn}
                        className="touch-feedback"
                        onClick={() => handleDurationChange(
                          item.id, 
                          (item.rentalDuration || 1) - 1
                        )}
                        disabled={item.rentalDuration <= 1 || updatingItem === item.id}
                      >
                        <Icon name="minus" size={isMobile ? 18 : 14} />
                      </button>
                      <input 
                        type="number" 
                        style={styles.durationInput}
                        min="1" 
                        max="30" 
                        value={item.rentalDuration || 1}
                        onChange={(e) => handleDurationChange(
                          item.id, 
                          parseInt(e.target.value) || 1
                        )}
                        disabled={updatingItem === item.id}
                      />
                      <button 
                        style={styles.durationBtn}
                        className="touch-feedback"
                        onClick={() => handleDurationChange(
                          item.id, 
                          (item.rentalDuration || 1) + 1
                        )}
                        disabled={item.rentalDuration >= 30 || updatingItem === item.id}
                      >
                        <Icon name="plus" size={isMobile ? 18 : 14} />
                      </button>
                    </div>
                    <div style={styles.durationTotal}>
                      Total: ₹{(item.price * (item.rentalDuration || 1)).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    style={styles.removeBtn}
                    className="touch-feedback"
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={removingItem === item.id}
                  >
                    <Icon name="trash" size={18} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <Link to="/browse" style={styles.continueShopping} className="touch-feedback">
            <Icon name="arrowLeft" size={18} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary Column */}
        <div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryHeader}>
              <Icon name="receipt" size={20} color="white" />
              <h4 style={styles.summaryHeaderTitle}>Order Summary</h4>
            </div>
            
            <div style={styles.summaryContent}>
              {/* Items Count */}
              <div style={styles.itemsCount}>
                <span style={styles.countBadge}>
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Cart Items Summary */}
              <div style={{...styles.itemsSummary, className: 'items-summary-scroll'}}>
                {cart.map(item => (
                  <div key={getUniqueKey(item)} style={styles.summaryItem}>
                    <span style={styles.summaryItemName}>
                      {!isMobile && item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                      {isMobile && item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
                      <span style={styles.itemDuration}> x{item.rentalDuration || 1}d</span>
                    </span>
                    <span style={styles.summaryItemPrice}>₹{(item.price * (item.rentalDuration || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div style={styles.priceBreakdown}>
                <div style={styles.breakdownRow}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div style={styles.breakdownRow}>
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                
                <div style={styles.breakdownRow}>
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span style={styles.freeDelivery}>FREE</span>
                  ) : (
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  )}
                </div>

                {deliveryFee > 0 && (
                  <div style={styles.deliveryInfo}>
                    <Icon name="info" size={14} />
                    Add ₹{(5000 - subtotal + 1).toFixed(2)} more for free delivery
                  </div>
                )}
              </div>

              <div style={styles.divider}></div>

              {/* Total */}
              <div style={styles.totalRow}>
                <h5 style={styles.totalLabel}>Total Amount</h5>
                <h5 style={styles.totalPrice}>₹{total.toFixed(2)}</h5>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                <button 
                  style={styles.checkoutBtn}
                  className="touch-feedback"
                  onClick={handleProceedToCheckout}
                  disabled={cart.length === 0}
                >
                  <Icon name="receipt" size={18} color="white" />
                  Proceed to Checkout
                </button>
                
                <Link to="/browse" style={styles.browseBtn} className="touch-feedback">
                  <Icon name="arrowRight" size={16} />
                  Browse More Laptops
                </Link>
              </div>

              {/* Secure Payment Badge */}
              <div style={styles.secureBadge}>
                <Icon name="lock" size={12} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;