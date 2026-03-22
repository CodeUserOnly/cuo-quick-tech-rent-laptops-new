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
  const [actionLoading, setActionLoading] = useState(false);

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
      default: return true;
    }
  });

  const stats = {
    total: orders.length,
    spent: orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
    active: orders.filter(o => ['pending', 'confirmed', 'shipped', 'delivered'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
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

  // Enhanced styles with EXTRA STRONG shadows and CLEAR borders - Fixed duplicate keys
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
    // Header - Strong shadow
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
    // Stats Grid
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '24px',
      marginBottom: '28px',
    },
    statCard: (color) => ({
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2), 0 5px 12px -5px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      transition: 'all 0.3s',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    }),
    statValue: {
      fontSize: 'clamp(28px, 4vw, 38px)',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '8px',
    },
    statLabel: {
      fontSize: '13px',
      color: '#6B7280',
      fontWeight: '600',
    },
    statIcon: {
      fontSize: '36px',
      opacity: 0.9,
    },
    // Rental Statistics Box - Extra strong shadow
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '24px',
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
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px',
    },
    rentalStatLabel: {
      fontSize: '12px',
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
    // Orders Section
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
      gap: '14px',
      flexWrap: 'wrap',
    },
    tab: (active, color) => ({
      padding: '10px 24px',
      borderRadius: '14px',
      border: active ? 'none' : '2px solid #e5e7eb',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: active ? color : 'white',
      color: active ? 'white' : '#6B7280',
      boxShadow: active ? `0 6px 16px ${color}80` : '0 2px 6px rgba(0,0,0,0.08)',
    }),
    ordersContent: {
      padding: '28px',
      background: '#f8fafc',
    },
    // Order Card - EXTRA STRONG SHADOW & CLEAR BORDER
    orderCard: {
      background: '#FFFFFF',
      borderRadius: '24px',
      padding: '28px',
      marginBottom: '28px',
      border: '3px solid #e2e8f0',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 8px 20px -6px rgba(0,0,0,0.15)',
      transition: 'all 0.3s',
      position: 'relative',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '20px',
      marginBottom: '24px',
      paddingBottom: '20px',
      borderBottom: '3px solid #eef2ff',
    },
    orderInfo: {
      flex: 1,
    },
    orderId: {
      fontSize: '13px',
      color: '#9CA3AF',
      fontFamily: 'monospace',
      marginBottom: '10px',
      letterSpacing: '0.5px',
      fontWeight: '500',
    },
    statusBadge: (bg, textColor, borderColor) => ({
      display: 'inline-block',
      padding: '8px 18px',
      borderRadius: '24px',
      fontSize: '13px',
      fontWeight: '700',
      background: bg,
      color: textColor,
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      border: `2px solid ${borderColor}`,
    }),
    orderTotal: {
      textAlign: 'right',
    },
    totalAmount: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1F2937',
    },
    totalLabel: {
      fontSize: '12px',
      color: '#9CA3AF',
      marginTop: '6px',
      fontWeight: '500',
    },
    // Status Timeline
    statusTimeline: {
      marginBottom: '24px',
      padding: '20px',
      background: '#F9FAFB',
      borderRadius: '20px',
      border: '2px solid #e5e7eb',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
    },
    timelineTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#6B7280',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    timelineSteps: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
    },
    timelineStep: (isActive, isCompleted, color) => ({
      flex: 1,
      minWidth: '85px',
      textAlign: 'center',
      padding: '12px 8px',
      borderRadius: '16px',
      background: isCompleted ? color : isActive ? `${color}15` : '#F3F4F6',
      border: `3px solid ${isCompleted ? color : isActive ? color : '#E5E7EB'}`,
      transition: 'all 0.2s',
      boxShadow: isCompleted ? `0 4px 12px ${color}60` : 'none',
    }),
    stepIcon: {
      fontSize: '24px',
      marginBottom: '6px',
    },
    stepLabel: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#374151',
    },
    // Devices List
    devicesList: {
      marginBottom: '24px',
    },
    deviceItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px',
      background: '#F9FAFB',
      borderRadius: '16px',
      marginBottom: '12px',
      border: '2px solid #e5e7eb',
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    deviceIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    deviceDetails: {
      flex: 1,
    },
    deviceName: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: '6px',
    },
    deviceSpecs: {
      fontSize: '13px',
      color: '#6B7280',
      fontWeight: '500',
    },
    // Return Info
    returnInfo: (urgent) => ({
      padding: '16px 20px',
      background: urgent ? '#FEF3C7' : '#F9FAFB',
      borderRadius: '16px',
      marginBottom: '24px',
      border: `3px solid ${urgent ? '#F59E0B' : '#E5E7EB'}`,
      boxShadow: urgent ? '0 4px 12px rgba(245, 158, 11, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
    }),
    returnText: {
      fontSize: '14px',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      fontWeight: '500',
    },
    // Action Buttons
    actionButtons: {
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap',
      marginTop: '8px',
    },
    actionBtn: (bg, color, borderColor) => ({
      flex: 1,
      minWidth: '120px',
      padding: '12px 20px',
      border: `2px solid ${borderColor}`,
      borderRadius: '14px',
      background: bg,
      color: color,
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    }),
    // Empty State
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
    },
    emptyIcon: {
      fontSize: '80px',
      marginBottom: '20px',
    },
    emptyTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '12px',
    },
    emptyText: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '28px',
    },
    // Quick Actions
    quickActions: {
      background: 'white',
      borderRadius: '28px',
      padding: '28px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
      border: '2px solid #eef2ff',
    },
    actionsTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '20px',
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '14px',
    },
    quickActionBtn: (gradient, color) => ({
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '16px',
      background: gradient,
      color: color,
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
    }),
    // Modal
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
      borderRadius: '28px',
      padding: '32px',
      maxWidth: '420px',
      width: '100%',
      boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
      border: '2px solid #eef2ff',
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '16px',
    },
    modalText: {
      fontSize: '15px',
      color: '#6B7280',
      marginBottom: '28px',
      lineHeight: '1.6',
    },
    modalButtons: {
      display: 'flex',
      gap: '14px',
    },
  };

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -6 }}
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
    const daysLeft = getDaysLeft(order.return_date);
    const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && order.status === 'delivered';
    const currentStep = status.step || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.35), 0 10px 25px -8px rgba(0,0,0,0.2)' }}
        style={styles.orderCard}
      >
        <div style={styles.cardHeader}>
          <div style={styles.orderInfo}>
            <div style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</div>
            <span style={styles.statusBadge(status.lightBg, status.textColor, status.borderColor)}>
              {status.icon} {status.label}
            </span>
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
                    {item.rental_duration} days • ₹{item.price}
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
              <div style={{ ...styles.returnText, marginTop: '8px', fontSize: '13px' }}>
                <span>⏰</span>
                <span style={{ fontWeight: isUrgent ? 'bold' : 'normal', color: isUrgent ? '#F59E0B' : '#6B7280' }}>
                  {daysLeft} days remaining
                </span>
              </div>
            )}
          </div>
        )}

        <div style={styles.actionButtons}>
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
                { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
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
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.02 }} style={styles.quickActionBtn('linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 'white')}>
                👤 Profile
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

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