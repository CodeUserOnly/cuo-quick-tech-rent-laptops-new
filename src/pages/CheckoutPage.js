import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RazorpayPayment from '../components/RazorpayPayment';

const CheckoutPage = ({ cart, user, createOrder, clearCart }) => {
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [rentalDays, setRentalDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [headerHeight, setHeaderHeight] = useState(80);
  const [dateError, setDateError] = useState('');
  const [activeSection, setActiveSection] = useState('delivery');
  const navigate = useNavigate();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Calculate rental days when dates change
  useEffect(() => {
    if (deliveryDate && returnDate) {
      const start = new Date(deliveryDate);
      const end = new Date(returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setDateError('');
      
      if (start < today) {
        setDateError('Delivery date cannot be in the past');
        setRentalDays(0);
        return;
      }
      
      if (end <= start) {
        setDateError('Return date must be after delivery date');
        setRentalDays(0);
        return;
      }
      
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setRentalDays(diffDays);
      }
    }
  }, [deliveryDate, returnDate]);

  // Calculate totals
  const calculateTotals = () => {
    const totalPrice = cart.reduce((sum, item) => {
      const days = rentalDays > 0 ? rentalDays : (item.rentalDuration || 1);
      return sum + (item.price * days);
    }, 0);
    
    const tax = totalPrice * 0.1;
    const deliveryCharge = totalPrice > 5000 ? 0 : 50;
    const codFee = paymentMethod === 'cod' ? 50 : 0;
    const finalTotal = totalPrice + tax + deliveryCharge + codFee;

    return { totalPrice, tax, deliveryCharge, codFee, finalTotal };
  };

  const { totalPrice, tax, deliveryCharge, codFee, finalTotal } = calculateTotals();

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setDeliveryDate(formatDate(today));
    setReturnDate(formatDate(nextWeek));
  }, []);

  // Get header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header') || document.querySelector('.navbar');
      if (header) {
        setHeaderHeight(header.offsetHeight + 20);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setActiveSection('payment');
  };

  // Validate delivery address
  const validateDeliveryAddress = () => {
    const errors = {};
    
    if (!deliveryAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!deliveryAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(deliveryAddress.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }
    if (!deliveryAddress.address.trim()) errors.address = 'Address is required';
    if (!deliveryAddress.city.trim()) errors.city = 'City is required';
    if (!deliveryAddress.state.trim()) errors.state = 'State is required';
    if (!deliveryAddress.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(deliveryAddress.zipCode)) {
      errors.zipCode = 'Enter a valid 6-digit pincode';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate all fields
  const validateOrder = () => {
    if (!validateDeliveryAddress()) {
      setPaymentError('Please fill all delivery information correctly');
      return false;
    }

    if (!deliveryDate || !returnDate) {
      setPaymentError('Please select both delivery and return dates');
      return false;
    }

    const start = new Date(deliveryDate);
    const end = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setPaymentError('Delivery date cannot be in the past');
      return false;
    }

    if (end <= start) {
      setPaymentError('Return date must be after delivery date');
      return false;
    }

    return true;
  };

  // Handle COD order
  const handleCODOrder = async () => {
    if (!validateOrder()) return;
    if (!user) {
      alert('Please log in to complete your order');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        user_id: user.id,
        total: finalTotal,
        delivery_address: JSON.stringify(deliveryAddress),
        delivery_date: deliveryDate,
        return_date: returnDate,
        rental_days: rentalDays,
        status: 'confirmed',
        payment_method: 'cod', // Set payment method to COD
        payment_status: 'pending', // Set payment status to pending
        items: cart.map(item => ({
          device_id: item.id,
          rental_duration: rentalDays,
          price: item.price,
          total_price: item.price * rentalDays
        }))
      };

      console.log('Creating COD order:', orderData);
      await createOrder(orderData);
      clearCart();
      navigate('/dashboard', { state: { orderSuccess: true } });
    } catch (error) {
      console.error('Order error:', error);
      setPaymentError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentDetails) => {
    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        total: finalTotal,
        delivery_address: JSON.stringify(deliveryAddress),
        delivery_date: deliveryDate,
        return_date: returnDate,
        rental_days: rentalDays,
        status: 'confirmed',
        payment_method: 'online', // Set payment method to online
        payment_status: 'paid', // Set payment status to paid
        payment_date: new Date().toISOString(),
        razorpay_order_id: paymentDetails.razorpayOrderId,
        razorpay_payment_id: paymentDetails.razorpayPaymentId,
        items: cart.map(item => ({
          device_id: item.id,
          rental_duration: rentalDays,
          price: item.price,
          total_price: item.price * rentalDays
        }))
      };

      console.log('Creating Online Payment order:', orderData);
      await createOrder(orderData);
      clearCart();
      navigate('/dashboard', { 
        state: { 
          paymentSuccess: true,
          paymentId: paymentDetails.razorpayPaymentId 
        } 
      });
    } catch (error) {
      console.error('Error saving order:', error);
      setPaymentError('Order placed but failed to save. Please contact support with payment ID: ' + paymentDetails.razorpayPaymentId);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (errorMessage) => {
    setPaymentError(errorMessage);
    setLoading(false);
  };

  const handleRazorpayClick = () => {
    if (!validateOrder()) return false;
    return true;
  };

  // Fixed styles
  const styles = {
    container: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '2rem 0',
    },
    containerInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    progressSteps: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      position: 'relative',
    },
    progressStep: {
      flex: 1,
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
    },
    stepCircle: {
      width: '40px',
      height: '40px',
      background: 'white',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#dee2e6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 0.5rem',
      transition: 'all 0.3s ease',
    },
    stepCircleActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderColor: '#667eea',
      color: 'white',
    },
    stepLabel: {
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    stepLabelActive: {
      color: '#667eea',
      fontWeight: 600,
    },
    sectionCard: {
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      marginBottom: '1.5rem',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#eef2ff',
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.25rem 1.5rem',
      border: 'none',
    },
    cardHeaderTitle: {
      margin: 0,
      color: 'white',
    },
    cardBody: {
      padding: '1.5rem',
    },
    formControl: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#e2e8f0',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      outline: 'none',
      background: 'white',
    },
    paymentOption: {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderRadius: '12px',
      marginBottom: '1rem',
      padding: '1rem',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#e2e8f0',
    },
    paymentOptionActive: {
      borderColor: '#667eea',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    },
    summaryCard: {
      position: 'sticky',
      top: `${headerHeight}px`,
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#eef2ff',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      color: 'white',
      cursor: 'pointer',
      width: '100%',
    },
    itemCard: {
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#e9ecef',
    },
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.containerInner}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-4"
            >
              <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#dc3545' }}></i>
            </motion.div>
            <h2 className="mb-3">Your Cart is Empty</h2>
            <p className="lead mb-4">Add some laptops to your cart to checkout.</p>
            <Link to="/browse" className="btn btn-primary btn-lg px-5">
              Browse Laptops
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.containerInner}>
        {/* Progress Steps */}
        <div style={styles.progressSteps}>
          <div style={styles.progressStep}>
            <div style={{
              ...styles.stepCircle,
              ...(activeSection === 'delivery' ? styles.stepCircleActive : {})
            }}>
              <i className="bi bi-truck"></i>
            </div>
            <div style={{
              ...styles.stepLabel,
              ...(activeSection === 'delivery' ? styles.stepLabelActive : {})
            }}>
              Delivery
            </div>
          </div>
          <div style={styles.progressStep}>
            <div style={{
              ...styles.stepCircle,
              ...(activeSection === 'dates' ? styles.stepCircleActive : {})
            }}>
              <i className="bi bi-calendar"></i>
            </div>
            <div style={{
              ...styles.stepLabel,
              ...(activeSection === 'dates' ? styles.stepLabelActive : {})
            }}>
              Dates
            </div>
          </div>
          <div style={styles.progressStep}>
            <div style={{
              ...styles.stepCircle,
              ...(activeSection === 'payment' ? styles.stepCircleActive : {})
            }}>
              <i className="bi bi-credit-card"></i>
            </div>
            <div style={{
              ...styles.stepLabel,
              ...(activeSection === 'payment' ? styles.stepLabelActive : {})
            }}>
              Payment
            </div>
          </div>
        </div>

        <h1 className="mb-4" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
          Complete Your Order
        </h1>

        <AnimatePresence>
          {paymentError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="alert alert-danger alert-dismissible fade show mb-4"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {paymentError}
              <button type="button" className="btn-close" onClick={() => setPaymentError('')}></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Delivery Information */}
              <motion.div variants={fadeInUp} style={styles.sectionCard}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardHeaderTitle}>
                    <i className="bi bi-truck me-2"></i>
                    Delivery Information
                  </h4>
                </div>
                <div style={styles.cardBody}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        name="fullName"
                        value={deliveryAddress.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        onFocus={() => setActiveSection('delivery')}
                      />
                      {formErrors.fullName && (
                        <div className="invalid-feedback">{formErrors.fullName}</div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="tel" 
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        name="phone"
                        value={deliveryAddress.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        onFocus={() => setActiveSection('delivery')}
                      />
                      {formErrors.phone && (
                        <div className="invalid-feedback">{formErrors.phone}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Address <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                      style={styles.formControl}
                      name="address"
                      value={deliveryAddress.address}
                      onChange={handleInputChange}
                      placeholder="House no., Building, Street, Area"
                      onFocus={() => setActiveSection('delivery')}
                    />
                    {formErrors.address && (
                      <div className="invalid-feedback">{formErrors.address}</div>
                    )}
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">
                        City <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        name="city"
                        value={deliveryAddress.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        onFocus={() => setActiveSection('delivery')}
                      />
                      {formErrors.city && (
                        <div className="invalid-feedback">{formErrors.city}</div>
                      )}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">
                        State <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${formErrors.state ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        name="state"
                        value={deliveryAddress.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        onFocus={() => setActiveSection('delivery')}
                      />
                      {formErrors.state && (
                        <div className="invalid-feedback">{formErrors.state}</div>
                      )}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">
                        ZIP Code <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${formErrors.zipCode ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        name="zipCode"
                        value={deliveryAddress.zipCode}
                        onChange={handleInputChange}
                        placeholder="6-digit pincode"
                        maxLength="6"
                        onFocus={() => setActiveSection('delivery')}
                      />
                      {formErrors.zipCode && (
                        <div className="invalid-feedback">{formErrors.zipCode}</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Rental Period */}
              <motion.div variants={fadeInUp} style={styles.sectionCard}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardHeaderTitle}>
                    <i className="bi bi-calendar-range me-2"></i>
                    Rental Period
                  </h4>
                </div>
                <div style={styles.cardBody}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Delivery Date</label>
                      <input 
                        type="date" 
                        className={`form-control ${dateError ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        onFocus={() => setActiveSection('dates')}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Return Date</label>
                      <input 
                        type="date" 
                        className={`form-control ${dateError ? 'is-invalid' : ''}`}
                        style={styles.formControl}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={deliveryDate || new Date().toISOString().split('T')[0]}
                        onFocus={() => setActiveSection('dates')}
                      />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {dateError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="alert alert-danger mt-2 mb-0"
                      >
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {dateError}
                      </motion.div>
                    )}
                    
                    {!dateError && deliveryDate && returnDate && rentalDays > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="alert alert-success mt-2 mb-0"
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Rental Period: <strong>{rentalDays} day{rentalDays > 1 ? 's' : ''}</strong>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div variants={fadeInUp} style={styles.sectionCard}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardHeaderTitle}>
                    <i className="bi bi-credit-card me-2"></i>
                    Payment Method
                  </h4>
                </div>
                <div style={styles.cardBody}>
                  <div className="payment-options">
                    <div 
                      style={{
                        ...styles.paymentOption,
                        ...(paymentMethod === 'razorpay' ? styles.paymentOptionActive : {})
                      }}
                      onClick={() => setPaymentMethod('razorpay')}
                    >
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="paymentMethod" 
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={handlePaymentMethodChange}
                          id="razorpay"
                        />
                        <label className="form-check-label w-100" htmlFor="razorpay">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <strong className="d-block">Pay Online</strong>
                              <small className="text-muted">Credit/Debit Card, UPI, Net Banking</small>
                            </div>
                            <span className="badge bg-success">Secure</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div 
                      style={{
                        ...styles.paymentOption,
                        ...(paymentMethod === 'cod' ? styles.paymentOptionActive : {})
                      }}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="paymentMethod" 
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={handlePaymentMethodChange}
                          id="cod"
                        />
                        <label className="form-check-label w-100" htmlFor="cod">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <strong className="d-block">Cash on Delivery</strong>
                              <small className="text-muted">Pay when you receive</small>
                            </div>
                            <span className="badge bg-warning text-dark">+₹50</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Place Order Button */}
              {paymentMethod === 'cod' && (
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleCODOrder}
                  style={styles.btnPrimary}
                  className="mb-4"
                  disabled={loading || !!dateError || rentalDays <= 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Place COD Order - ₹{finalTotal.toFixed(2)}
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={styles.summaryCard}
            >
              <div style={styles.cardHeader}>
                <h4 style={styles.cardHeaderTitle}>
                  <i className="bi bi-cart-check me-2"></i>
                  Order Summary
                </h4>
              </div>
              
              <div style={styles.cardBody}>
                {/* Cart Items */}
                <div className="cart-items mb-4">
                  <h6 className="text-muted mb-3">Items ({cart.length})</h6>
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.id}_${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={styles.itemCard}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{item.name}</h6>
                          <small className="text-muted">
                            {rentalDays > 0 ? rentalDays : (item.rentalDuration || 1)} days × ₹{item.price}/day
                          </small>
                        </div>
                        <div className="fw-bold text-primary ms-3">
                          ₹{(item.price * (rentalDays > 0 ? rentalDays : (item.rentalDuration || 1))).toFixed(2)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Price Breakdown */}
                <div className="price-breakdown mb-3">
                  <h6 className="text-muted mb-3">Price Details</h6>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal ({rentalDays > 0 ? rentalDays : (cart[0]?.rentalDuration || 1)} days):</span>
                    <span className="fw-bold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (10%):</span>
                    <span className="fw-bold">₹{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Delivery Charge:</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-success fw-bold">FREE</span>
                    ) : (
                      <span className="fw-bold">₹{deliveryCharge.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {paymentMethod === 'cod' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span>COD Handling Fee:</span>
                      <span className="fw-bold">₹{codFee.toFixed(2)}</span>
                    </motion.div>
                  )}
                </div>
                
                <hr className="my-3" />
                
                {/* Final Total */}
                <div className="d-flex justify-content-between mb-4">
                  <h5 className="fw-bold">Total Amount:</h5>
                  <h5 className="fw-bold text-primary">₹{finalTotal.toFixed(2)}</h5>
                </div>

                {/* Razorpay Payment Button */}
                {paymentMethod === 'razorpay' && (
                  <div className="razorpay-container">
                    {!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address || 
                     !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode ? (
                      <button 
                        className="btn btn-secondary btn-lg w-100"
                        disabled
                      >
                        <i className="bi bi-exclamation-circle me-2"></i>
                        Fill delivery details first
                      </button>
                    ) : dateError || rentalDays <= 0 ? (
                      <button 
                        className="btn btn-secondary btn-lg w-100"
                        disabled
                      >
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {dateError || 'Select valid rental dates'}
                      </button>
                    ) : (
                      <div onClick={handleRazorpayClick}>
                        <RazorpayPayment
                          amount={finalTotal}
                          userDetails={{ ...user, ...deliveryAddress }}
                          onSuccess={handlePaymentSuccess}
                          onFailure={handlePaymentFailure}
                          orderItems={cart.map(item => ({
                            ...item,
                            rentalDays: rentalDays
                          }))}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Security Badge */}
                <div className="text-center mt-4">
                  <div className="d-flex justify-content-center gap-3 mb-2">
                    <span className="badge bg-light text-dark p-2">
                      <i className="bi bi-shield-lock-fill me-1"></i>
                      100% Secure
                    </span>
                    <span className="badge bg-light text-dark p-2">
                      <i className="bi bi-arrow-repeat me-1"></i>
                      7-Day Returns
                    </span>
                  </div>
                  <small className="text-muted d-block">
                    By placing this order, you agree to our 
                    <Link to="/terms" className="text-primary ms-1">Terms of Service</Link>
                  </small>
                </div>
              </div>
            </motion.div>

            {/* Back to Cart Button */}
            <div className="mt-3">
              <Link to="/cart" className="btn btn-outline-secondary w-100 py-2 rounded-3">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
