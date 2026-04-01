import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersService } from '../services/supabase';
import { supabase } from '../supabase/client';

const UserDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (user?.id) {
        try {
          const userOrders = await ordersService.getByUserId(user.id);
          setOrders(userOrders);
        } catch (error) {
          console.error('Error loading orders:', error);
          const savedOrders = localStorage.getItem('orders');
          if (savedOrders) {
            const parsedOrders = JSON.parse(savedOrders);
            const userOrders = parsedOrders.filter(order => order.user_id === user.id);
            setOrders(userOrders);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active': return ['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status);
      case 'completed': return order.status === 'completed';
      case 'cancelled': return order.status === 'cancelled';
      case 'pending_payment': return order.payment_status === 'pending';
      default: return true;
    }
  });

  const stats = {
    total: orders.length,
    spent: orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
    active: orders.filter(o => ['pending', 'confirmed', 'shipped', 'delivered'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
    pendingPayment: orders.filter(o => o.payment_status === 'pending' && o.payment_method === 'cod').length,
    totalPaid: orders.filter(o => o.payment_status === 'paid').reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
    totalPending: orders.filter(o => o.payment_status === 'pending').reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
  };

  const cancelOrder = async (orderId) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
      alert('✅ Order cancelled successfully!');
      setShowCancelModal(false);
      setSelectedOrder(null);
    } catch (error) {
      alert('❌ Failed to cancel order. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.filter(order => order.id !== orderId));
      alert('🗑️ Order deleted successfully!');
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      alert('❌ Failed to delete order.');
    } finally {
      setActionLoading(false);
    }
  };

  const viewPaymentDetails = (order) => {
    setSelectedOrder(order);
    setPaymentDetails({
      method: order.payment_method,
      status: order.payment_status,
      date: order.payment_date,
      transactionId: order.razorpay_payment_id,
      amount: order.total
    });
    setShowPaymentModal(true);
  };

  const getStatusStyle = (status) => {
    const styles = {
      completed: { bg: '#10B981', color: 'white', icon: '✓', label: 'Completed', lightBg: '#D1FAE5', textColor: '#065F46', step: 5, borderColor: '#10B981' },
      delivered: { bg: '#3B82F6', color: 'white', icon: '📦', label: 'Delivered', lightBg: '#DBEAFE', textColor: '#1E40AF', step: 4, borderColor: '#3B82F6' },
      shipped: { bg: '#8B5CF6', color: 'white', icon: '🚚', label: 'Shipped', lightBg: '#EDE9FE', textColor: '#5B21B6', step: 3, borderColor: '#8B5CF6' },
      confirmed: { bg: '#F59E0B', color: 'white', icon: '✓', label: 'Confirmed', lightBg: '#FEF3C7', textColor: '#92400E', step: 2, borderColor: '#F59E0B' },
      pending: { bg: '#EF4444', color: 'white', icon: '⏳', label: 'Pending', lightBg: '#FEE2E2', textColor: '#991B1B', step: 1, borderColor: '#EF4444' },
      cancelled: { bg: '#6B7280', color: 'white', icon: '✗', label: 'Cancelled', lightBg: '#F3F4F6', textColor: '#374151', step: 0, borderColor: '#6B7280' }
    };
    return styles[status] || styles.pending;
  };

  const getPaymentStyle = (method, status) => {
    if (method === 'online') {
      return status === 'paid' 
        ? { bg: '#D1FAE5', color: '#065F46', icon: '✅', label: 'Paid Online' }
        : { bg: '#FEE2E2', color: '#991B1B', icon: '⏳', label: 'Payment Failed' };
    } else {
      return status === 'paid'
        ? { bg: '#D1FAE5', color: '#065F46', icon: '✅', label: 'COD - Paid' }
        : { bg: '#FEF3C7', color: '#92400E', icon: '💵', label: 'COD - Pending' };
    }
  };

  const getDaysLeft = (returnDate) => {
    if (!returnDate) return null;
    const days = Math.ceil((new Date(returnDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝', color: '#EF4444' },
    { key: 'confirmed', label: 'Confirmed', icon: '✓', color: '#F59E0B' },
    { key: 'shipped', label: 'Shipped', icon: '🚚', color: '#8B5CF6' },
    { key: 'delivered', label: 'Delivered', icon: '📦', color: '#3B82F6' },
    { key: 'completed', label: 'Completed', icon: '🎯', color: '#10B981' }
  ];

  // Enhanced styles
  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
      padding: '24px',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      background: 'white',
      borderRadius: '24px',
      padding: '28px',
      marginBottom: '28px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
      border: '2px solid #eef2ff',
    },
    welcomeBadge: {
      display: 'inline-block',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      fontSize: '12px',
      color: 'white',
      marginBottom: '12px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    title: {
      fontSize: 'clamp(24px, 5vw, 32px)',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
    },
    rentButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '1px solid rgba(255,255,255,0.2)',
      padding: '14px 32px',
      borderRadius: '14px',
      color: 'white',
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.5)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '28px',
    },
    statCard: (color) => ({
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2), 0 5px 12px -5px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      transition: 'all 0.3s',
      cursor: 'pointer',
    }),
    statValue: {
      fontSize: 'clamp(24px, 3vw, 32px)',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '8px',
    },
    statLabel: {
      fontSize: '12px',
      color: '#6B7280',
      fontWeight: '600',
    },
    statIcon: {
      fontSize: '32px',
      opacity: 0.8,
    },
    rentalStatsBox: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '28px',
      padding: '28px',
      marginBottom: '28px',
      boxShadow: '0 25px 45px -12px rgba(102, 126, 234, 0.5), 0 10px 20px -8px rgba(0,0,0,0.2)',
      border: '2px solid rgba(255,255,255,0.3)',
    },
    rentalStatsTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '24px',
    },
    rentalStatsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '20px',
    },
    rentalStatItem: {
      textAlign: 'center',
      background: 'rgba(255,255,255,0.15)',
      padding: '16px',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    rentalStatValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px',
    },
    rentalStatLabel: {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.95)',
      fontWeight: '500',
    },
    progressBar: {
      marginTop: '24px',
      background: 'rgba(255,255,255,0.25)',
      borderRadius: '12px',
      height: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    progressFill: {
      background: 'white',
      height: '100%',
      borderRadius: '12px',
      transition: 'width 0.3s',
      boxShadow: '0 0 8px rgba(255,255,255,0.8)',
    },
    ordersSection: {
      background: 'white',
      borderRadius: '28px',
      overflow: 'hidden',
      marginBottom: '28px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
      border: '2px solid #eef2ff',
    },
    ordersHeader: {
      padding: '28px',
      borderBottom: '3px solid #eef2ff',
      background: 'linear-gradient(135deg, #fafbff 0%, #ffffff 100%)',
    },
    ordersTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '20px',
    },
    tabs: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    tab: (active, color) => ({
      padding: '10px 20px',
      borderRadius: '12px',
      border: active ? 'none' : '2px solid #e5e7eb',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: active ? color : 'white',
      color: active ? 'white' : '#6B7280',
      boxShadow: active ? `0 4px 12px ${color}80` : '0 2px 4px rgba(0,0,0,0.05)',
    }),
    ordersContent: {
      padding: '28px',
      background: '#f8fafc',
    },
    orderCard: {
      background: '#FFFFFF',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      border: '3px solid #e2e8f0',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.2), 0 4px 12px -6px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '2px solid #eef2ff',
    },
    orderInfo: {
      flex: 1,
    },
    orderId: {
      fontSize: '12px',
      color: '#9CA3AF',
      fontFamily: 'monospace',
      marginBottom: '8px',
      fontWeight: '500',
    },
    statusBadge: (bg, textColor, borderColor) => ({
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      background: bg,
      color: textColor,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${borderColor}`,
    }),
    paymentBadge: (bg, color) => ({
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      background: bg,
      color: color,
      marginLeft: '10px',
    }),
    orderTotal: {
      textAlign: 'right',
    },
    totalAmount: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1F2937',
    },
    totalLabel: {
      fontSize: '11px',
      color: '#9CA3AF',
      marginTop: '4px',
      fontWeight: '500',
    },
    statusTimeline: {
      marginBottom: '20px',
      padding: '16px',
      background: '#F9FAFB',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
    },
    timelineTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#6B7280',
      marginBottom: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    timelineSteps: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px',
    },
    timelineStep: (isActive, isCompleted, color) => ({
      flex: 1,
      minWidth: '70px',
      textAlign: 'center',
      padding: '8px 4px',
      borderRadius: '12px',
      background: isCompleted ? color : isActive ? `${color}15` : '#F3F4F6',
      border: `2px solid ${isCompleted ? color : isActive ? color : '#E5E7EB'}`,
      transition: 'all 0.2s',
    }),
    stepIcon: {
      fontSize: '20px',
      marginBottom: '4px',
    },
    stepLabel: {
      fontSize: '10px',
      fontWeight: '600',
      color: '#374151',
    },
    devicesList: {
      marginBottom: '20px',
    },
    deviceItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: '#F9FAFB',
      borderRadius: '14px',
      marginBottom: '10px',
      border: '1px solid #e5e7eb',
    },
    deviceIcon: {
      width: '44px',
      height: '44px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    },
    deviceDetails: {
      flex: 1,
    },
    deviceName: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: '4px',
    },
    deviceSpecs: {
      fontSize: '12px',
      color: '#6B7280',
      fontWeight: '500',
    },
    returnInfo: (urgent) => ({
      padding: '12px 16px',
      background: urgent ? '#FEF3C7' : '#F9FAFB',
      borderRadius: '14px',
      marginBottom: '20px',
      border: `2px solid ${urgent ? '#F59E0B' : '#E5E7EB'}`,
    }),
    returnText: {
      fontSize: '13px',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      fontWeight: '500',
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginTop: '8px',
    },
    actionBtn: (bg, color, borderColor) => ({
      padding: '10px 18px',
      border: `2px solid ${borderColor}`,
      borderRadius: '12px',
      background: bg,
      color: color,
      fontWeight: '600',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      flex: 1,
      minWidth: '100px',
    }),
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '10px',
    },
    emptyText: {
      fontSize: '13px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    quickActions: {
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.2), 0 4px 12px -6px rgba(0,0,0,0.1)',
      border: '2px solid #eef2ff',
    },
    actionsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '16px',
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
    },
    quickActionBtn: (gradient, color) => ({
      padding: '14px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '14px',
      background: gradient,
      color: color,
      fontWeight: '600',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }),
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      background: 'white',
      borderRadius: '24px',
      padding: '28px',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
      border: '2px solid #eef2ff',
    },
    modalTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '16px',
    },
    modalText: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
      lineHeight: '1.5',
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
    },
    paymentDetails: {
      background: '#F9FAFB',
      padding: '16px',
      borderRadius: '16px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb',
    },
    paymentRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #e5e7eb',
    },
    paymentLabel: {
      fontWeight: '600',
      color: '#374151',
      fontSize: '13px',
    },
    paymentValue: {
      color: '#1F2937',
      fontWeight: '500',
      fontSize: '13px',
    },
  };

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      style={styles.statCard(color)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={styles.statValue}>{value}</div>
          <div style={styles.statLabel}>{title}</div>
        </div>
        <div style={styles.statIcon}>{icon}</div>
      </div>
    </motion.div>
  );

  const OrderCard = ({ order }) => {
    const status = getStatusStyle(order.status);
    const payment = getPaymentStyle(order.payment_method, order.payment_status);
    const daysLeft = getDaysLeft(order.return_date);
    const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && order.status === 'delivered';
    const currentStep = status.step || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        style={styles.orderCard}
      >
        <div style={styles.cardHeader}>
          <div style={styles.orderInfo}>
            <div style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</div>
            <div>
              <span style={styles.statusBadge(status.lightBg, status.textColor, status.borderColor)}>
                {status.icon} {status.label}
              </span>
              <span style={styles.paymentBadge(payment.bg, payment.color)}>
                {payment.icon} {payment.label}
              </span>
            </div>
          </div>
          <div style={styles.orderTotal}>
            <div style={styles.totalAmount}>₹{parseFloat(order.total || 0).toFixed(2)}</div>
            <div style={styles.totalLabel}>Total Amount</div>
          </div>
        </div>

        {/* Status Timeline */}
        <div style={styles.statusTimeline}>
          <div style={styles.timelineTitle}>📊 ORDER STATUS TIMELINE</div>
          <div style={styles.timelineSteps}>
            {statusSteps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = currentStep > stepNumber;
              const isActive = currentStep === stepNumber;
              const stepColor = step.color;
              
              return (
                <div key={step.key} style={styles.timelineStep(isActive, isCompleted, stepColor)}>
                  <div style={styles.stepIcon}>{step.icon}</div>
                  <div style={styles.stepLabel}>{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {order.order_items?.length > 0 && (
          <div style={styles.devicesList}>
            {order.order_items.map((item, idx) => (
              <div key={idx} style={styles.deviceItem}>
                <div style={styles.deviceIcon}>💻</div>
                <div style={styles.deviceDetails}>
                  <div style={styles.deviceName}>{item.devices?.name || 'Premium Laptop'}</div>
                  <div style={styles.deviceSpecs}>
                    {item.rental_duration} days × ₹{item.price}/day = ₹{item.total_price || (item.price * item.rental_duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {order.return_date && (
          <div style={styles.returnInfo(isUrgent)}>
            <div style={styles.returnText}>
              <span>📅</span>
              <span>Return by: {new Date(order.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {daysLeft !== null && daysLeft > 0 && order.status === 'delivered' && (
              <div style={{ ...styles.returnText, marginTop: '6px', fontSize: '12px' }}>
                <span>⏰</span>
                <span style={{ fontWeight: isUrgent ? 'bold' : 'normal', color: isUrgent ? '#F59E0B' : '#6B7280' }}>
                  {daysLeft} days remaining
                </span>
              </div>
            )}
          </div>
        )}

        <div style={styles.actionButtons}>
          <motion.button
            whileHover={{ scale: 0.98 }}
            onClick={() => viewPaymentDetails(order)}
            style={styles.actionBtn('#DBEAFE', '#3B82F6', '#BFDBFE')}
          >
            💳 Payment Details
          </motion.button>
          
          {['pending', 'confirmed'].includes(order.status) && (
            <motion.button
              whileHover={{ scale: 0.98 }}
              onClick={() => { setSelectedOrder(order); setShowCancelModal(true); }}
              style={styles.actionBtn('#FEE2E2', '#DC2626', '#FECACA')}
            >
              ❌ Cancel Order
            </motion.button>
          )}
          
          {['cancelled', 'completed'].includes(order.status) && (
            <motion.button
              whileHover={{ scale: 0.98 }}
              onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }}
              style={styles.actionBtn('#F3F4F6', '#6B7280', '#E5E7EB')}
            >
              🗑️ Delete
            </motion.button>
          )}
          
          {order.status === 'delivered' && (
            <motion.button
              whileHover={{ scale: 0.98 }}
              onClick={() => alert('📞 Contact support: support@laptoprental.com')}
              style={styles.actionBtn('#DBEAFE', '#3B82F6', '#BFDBFE')}
            >
              ⚙️ Manage Rental
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ ...styles.ordersSection, textAlign: 'center', padding: '60px' }}
          >
            <div style={styles.emptyIcon}>🔐</div>
            <h2 style={styles.emptyTitle}>Welcome Back!</h2>
            <p style={styles.emptyText}>Please log in to view your dashboard</p>
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.05 }} style={styles.rentButton}>
                Login to Account
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const completionRate = stats.total ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={styles.welcomeBadge}>✨ Premium Member</div>
              <h1 style={styles.title}>My Dashboard</h1>
              <p style={styles.subtitle}>Welcome back, {user.name}!</p>
            </div>
            <Link to="/browse">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.rentButton}>
                <span>➕</span> Rent New Laptop
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <StatCard title="Total Orders" value={stats.total} icon="📦" color="#667eea" />
          <StatCard title="Total Spent" value={`₹${stats.spent.toFixed(0)}`} icon="💰" color="#10b981" />
          <StatCard title="Active Rentals" value={stats.active} icon="⚡" color="#f59e0b" />
          <StatCard title="Completed" value={stats.completed} icon="🎯" color="#8b5cf6" />
          <StatCard title="Paid Amount" value={`₹${stats.totalPaid.toFixed(0)}`} icon="✅" color="#10b981" />
          <StatCard title="Pending Payment" value={`₹${stats.totalPending.toFixed(0)}`} icon="⏳" color="#f59e0b" />
        </div>

        {/* Rental Statistics Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.rentalStatsBox}
        >
          <div style={styles.rentalStatsTitle}>📊 Rental Statistics</div>
          <div style={styles.rentalStatsGrid}>
            <div style={styles.rentalStatItem}>
              <div style={styles.rentalStatValue}>{stats.total}</div>
              <div style={styles.rentalStatLabel}>Total Rentals</div>
            </div>
            <div style={styles.rentalStatItem}>
              <div style={styles.rentalStatValue}>{stats.completed}</div>
              <div style={styles.rentalStatLabel}>Completed</div>
            </div>
            <div style={styles.rentalStatItem}>
              <div style={styles.rentalStatValue}>{stats.active}</div>
              <div style={styles.rentalStatLabel}>Active</div>
            </div>
            <div style={styles.rentalStatItem}>
              <div style={styles.rentalStatValue}>{stats.pendingPayment}</div>
              <div style={styles.rentalStatLabel}>Pending Payments</div>
            </div>
            <div style={styles.rentalStatItem}>
              <div style={styles.rentalStatValue}>{Math.round(completionRate)}%</div>
              <div style={styles.rentalStatLabel}>Completion Rate</div>
            </div>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${completionRate}%` }} />
          </div>
        </motion.div>

        {/* Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.ordersSection}
        >
          <div style={styles.ordersHeader}>
            <div style={styles.ordersTitle}>Your Orders</div>
            <div style={styles.tabs}>
              {[
                { id: 'all', label: 'All', count: orders.length, color: '#667eea' },
                { id: 'active', label: 'Active', count: stats.active, color: '#f59e0b' },
                { id: 'completed', label: 'Completed', count: stats.completed, color: '#10b981' },
                { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
                { id: 'pending_payment', label: 'Pending Payment', count: stats.pendingPayment, color: '#f59e0b' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={styles.tab(activeTab === tab.id, tab.color)}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          <div style={styles.ordersContent}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Loading your orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <AnimatePresence>
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <h3 style={styles.emptyTitle}>No orders found</h3>
                <p style={styles.emptyText}>
                  {activeTab === 'all' ? "Start your first rental today!" : `You don't have any ${activeTab} orders.`}
                </p>
                <Link to="/browse">
                  <motion.button whileHover={{ scale: 1.05 }} style={styles.rentButton}>
                    Browse Laptops →
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.quickActions}
        >
          <div style={styles.actionsTitle}>Quick Actions</div>
          <div style={styles.actionsGrid}>
            <Link to="/browse" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.02 }} style={styles.quickActionBtn('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'white')}>
                💻 Browse Laptops
              </motion.button>
            </Link>
            <Link to="/cart" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.02 }} style={styles.quickActionBtn('linear-gradient(135deg, #10b981 0%, #059669 100%)', 'white')}>
                🛒 View Cart
              </motion.button>
            </Link>
            <Link to="/support" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.02 }} style={styles.quickActionBtn('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 'white')}>
                🎧 Support
              </motion.button>
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.02 }} style={styles.quickActionBtn('linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 'white')}>
                👤 Profile
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showPaymentModal && paymentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modal}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>💳 Payment Details</h3>
              <div style={styles.paymentDetails}>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Order ID:</span>
                  <span style={styles.paymentValue}>#{selectedOrder?.id.slice(-8).toUpperCase()}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Amount:</span>
                  <span style={styles.paymentValue}>₹{parseFloat(paymentDetails.amount || 0).toFixed(2)}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Payment Method:</span>
                  <span style={styles.paymentValue}>
                    {paymentDetails.method === 'online' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                  </span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Payment Status:</span>
                  <span style={styles.paymentValue}>
                    {paymentDetails.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
                {paymentDetails.date && (
                  <div style={styles.paymentRow}>
                    <span style={styles.paymentLabel}>Payment Date:</span>
                    <span style={styles.paymentValue}>
                      {new Date(paymentDetails.date).toLocaleString()}
                    </span>
                  </div>
                )}
                {paymentDetails.transactionId && (
                  <div style={styles.paymentRow}>
                    <span style={styles.paymentLabel}>Transaction ID:</span>
                    <span style={styles.paymentValue}>{paymentDetails.transactionId}</span>
                  </div>
                )}
              </div>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{ ...styles.actionBtn('#667eea', 'white', '#667eea'), flex: 1 }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modal}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>Cancel Order</h3>
              <p style={styles.modalText}>Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{ ...styles.actionBtn('#F3F4F6', '#6B7280', '#E5E7EB'), flex: 1 }}
                >
                  Keep Order
                </button>
                <button
                  onClick={() => cancelOrder(selectedOrder.id)}
                  disabled={actionLoading}
                  style={{ ...styles.actionBtn('#DC2626', 'white', '#DC2626'), flex: 1 }}
                >
                  {actionLoading ? 'Processing...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modal}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>Delete Order</h3>
              <p style={styles.modalText}>This will permanently delete this order. This action cannot be undone.</p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{ ...styles.actionBtn('#F3F4F6', '#6B7280', '#E5E7EB'), flex: 1 }}
                >
                  Keep
                </button>
                <button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  disabled={actionLoading}
                  style={{ ...styles.actionBtn('#DC2626', 'white', '#DC2626'), flex: 1 }}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
