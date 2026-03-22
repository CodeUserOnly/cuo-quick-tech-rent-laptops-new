import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usersService } from '../services/supabase';
import { supabase } from '../supabase/client';

const AdminPanel = ({ devices, addDevice, updateDevice, deleteDevice, user }) => {
  const [activeTab, setActiveTab] = useState('devices');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    image: '',
    processor: '',
    ram: '',
    storage: '',
    display: '',
    graphics: '',
    available: true,
    location: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const usersData = await usersService.getAll();
      setUsers(usersData);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!ordersError) setOrders(ordersData || []);

      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          devices (name, brand, image),
          orders (status, total, user_id)
        `);
      
      if (!itemsError) setOrderItems(orderItemsData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const deviceData = {
        name: formData.name,
        brand: formData.brand,
        price: formData.price,
        image: formData.image,
        location: formData.location,
        available: formData.available,
        specs: {
          processor: formData.processor,
          ram: formData.ram,
          storage: formData.storage,
          display: formData.display,
          graphics: formData.graphics
        }
      };

      if (editingDevice) {
        await updateDevice(editingDevice.id, deviceData);
      } else {
        await addDevice(deviceData);
      }
      
      resetForm();
      
    } catch (error) {
      console.error('Error saving device:', error);
      alert(`Failed to save device: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      image: '',
      processor: '',
      ram: '',
      storage: '',
      display: '',
      graphics: '',
      available: true,
      location: ''
    });
    setShowAddForm(false);
    setEditingDevice(null);
  };

  const toggleAvailability = async (device) => {
    try {
      const updatedDevice = { ...device, available: !device.available };
      await updateDevice(device.id, updatedDevice);
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability');
    }
  };

  const editDevice = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name || '',
      brand: device.brand || '',
      price: device.price || '',
      image: device.image || '',
      processor: device.specs?.processor || '',
      ram: device.specs?.ram || '',
      storage: device.specs?.storage || '',
      display: device.specs?.display || '',
      graphics: device.specs?.graphics || '',
      available: device.available !== undefined ? device.available : true,
      location: device.location || ''
    });
    setShowAddForm(true);
    
    setTimeout(() => {
      const formElement = document.querySelector('.form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (!error) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('⚠️ Are you sure you want to delete this order permanently? This action cannot be undone!')) {
      try {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) throw error;
        
        setOrders(prev => prev.filter(order => order.id !== orderId));
        setOrderItems(prev => prev.filter(item => item.order_id !== orderId));
        alert('✅ Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert(`❌ Failed to delete order: ${error.message}`);
      }
    }
  };

  const deleteOrderItem = async (orderItemId) => {
    if (window.confirm('⚠️ Are you sure you want to delete this order item permanently?')) {
      try {
        const { error } = await supabase.from('order_items').delete().eq('id', orderItemId);
        if (error) throw error;
        setOrderItems(prev => prev.filter(item => item.id !== orderItemId));
        alert('✅ Order item deleted successfully!');
      } catch (error) {
        console.error('Error deleting order item:', error);
        alert(`❌ Failed to delete order item: ${error.message}`);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersService.delete(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('✅ User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('❌ Failed to delete user');
      }
    }
  };

  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  const getUserOrders = (userId) => orders.filter(order => order.user_id === userId);

  // Modern styles
  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
      padding: '24px',
    },
    container: {
      maxWidth: '1400px',
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '28px',
    },
    statCard: (color) => ({
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2), 0 5px 12px -5px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }),
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '8px',
    },
    statLabel: {
      fontSize: '13px',
      color: '#6B7280',
      fontWeight: '500',
    },
    tabsContainer: {
      background: 'white',
      borderRadius: '20px',
      padding: '16px',
      marginBottom: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      border: '2px solid #eef2ff',
    },
    tabs: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    tab: (active, color) => ({
      padding: '10px 24px',
      borderRadius: '12px',
      border: active ? 'none' : '1px solid #e5e7eb',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: active ? color : '#F9FAFB',
      color: active ? 'white' : '#6B7280',
      boxShadow: active ? `0 4px 12px ${color}80` : '0 1px 3px rgba(0,0,0,0.1)',
    }),
    formCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '28px',
      marginBottom: '28px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
      border: '2px solid #eef2ff',
    },
    formTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '3px solid #eef2ff',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
    },
    inputGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '10px 14px',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      background: '#F9FAFB',
    },
    tableCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
      border: '2px solid #eef2ff',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '14px',
      background: '#F9FAFB',
      borderBottom: '2px solid #E5E7EB',
      fontWeight: '600',
      color: '#374151',
      fontSize: '13px',
    },
    td: {
      padding: '14px',
      borderBottom: '1px solid #F3F4F6',
      fontSize: '14px',
    },
    badge: (bg, color) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: bg,
      color: color,
    }),
    button: (bg, color, borderColor) => ({
      padding: '8px 16px',
      border: borderColor ? `2px solid ${borderColor}` : 'none',
      borderRadius: '10px',
      background: bg,
      color: color,
      fontWeight: '600',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }),
    actionGroup: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    quickActionsCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
      border: '2px solid #eef2ff',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '16px',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '60px',
    },
    loadingIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    loadingText: {
      color: '#6B7280',
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
        <div style={{ fontSize: '36px' }}>{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.header}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={styles.welcomeBadge}>👑 Admin Access</div>
              <h1 style={styles.title}>Admin Dashboard</h1>
              <p style={styles.subtitle}>Complete management system for your laptop rental business</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <StatCard title="Total Devices" value={devices.length} icon="💻" color="#667eea" />
          <StatCard title="Total Users" value={totalUsers} icon="👥" color="#10b981" />
          <StatCard title="Total Orders" value={totalOrders} icon="📦" color="#f59e0b" />
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon="💰" color="#8b5cf6" />
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            {[
              { id: 'devices', label: '💻 Devices', color: '#667eea' },
              { id: 'users', label: '👥 Users', color: '#10b981' },
              { id: 'orders', label: '📦 Orders', color: '#f59e0b' },
              { id: 'orderItems', label: '🛒 Order Items', color: '#3b82f6' },
              { id: 'analytics', label: '📊 Analytics', color: '#8b5cf6' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={styles.tab(activeTab === tab.id, tab.color)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.loadingContainer}
          >
            <div style={styles.loadingIcon}>⏳</div>
            <p style={styles.loadingText}>Loading data...</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Devices Tab */}
          {activeTab === 'devices' && !loading && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>📱 Laptop Inventory</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetForm();
                    setShowAddForm(!showAddForm);
                  }}
                  style={styles.button('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'white', null)}
                >
                  {showAddForm ? '❌ Cancel' : '➕ Add New Laptop'}
                </motion.button>
              </div>

              <AnimatePresence>
                {(showAddForm || editingDevice) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3 }}
                    style={styles.formCard}
                    className="form-card"
                  >
                    <h3 style={styles.formTitle}>
                      {editingDevice ? `✏️ Edit Laptop: ${editingDevice.name}` : '➕ Add New Laptop'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                      <div style={styles.formGrid}>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Name *</label>
                          <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Brand *</label>
                          <input 
                            type="text" 
                            name="brand" 
                            value={formData.brand} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Price per Day (₹) *</label>
                          <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleFormChange} 
                            step="0.01" 
                            min="0" 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Location *</label>
                          <input 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Image URL *</label>
                          <input 
                            type="url" 
                            name="image" 
                            value={formData.image} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Processor *</label>
                          <input 
                            type="text" 
                            name="processor" 
                            value={formData.processor} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>RAM *</label>
                          <input 
                            type="text" 
                            name="ram" 
                            value={formData.ram} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Storage *</label>
                          <input 
                            type="text" 
                            name="storage" 
                            value={formData.storage} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Display *</label>
                          <input 
                            type="text" 
                            name="display" 
                            value={formData.display} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Graphics *</label>
                          <input 
                            type="text" 
                            name="graphics" 
                            value={formData.graphics} 
                            onChange={handleFormChange} 
                            required 
                            disabled={saving} 
                            style={styles.input} 
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                        <input 
                          type="checkbox" 
                          name="available" 
                          checked={formData.available} 
                          onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))} 
                          disabled={saving} 
                        />
                        <label style={styles.label}>Available for rental</label>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.button 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }} 
                          type="submit" 
                          disabled={saving} 
                          style={styles.button('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'white', null)}
                        >
                          {saving ? (editingDevice ? 'Updating...' : 'Adding...') : (editingDevice ? '✏️ Update Laptop' : '➕ Add Laptop')}
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }} 
                          type="button" 
                          onClick={resetForm} 
                          style={styles.button('#F3F4F6', '#6B7280', '#E5E7EB')}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Brand</th>
                      <th style={styles.th}>Price/Day</th>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(device => (
                      <motion.tr 
                        key={device.id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        whileHover={{ backgroundColor: '#F9FAFB' }}
                        transition={{ duration: 0.2 }}
                      >
                        <td style={styles.td}>{device.name}</td>
                        <td style={styles.td}>{device.brand}</td>
                        <td style={styles.td}>₹{device.price}</td>
                        <td style={styles.td}>{device.location}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(
                            device.available ? '#D1FAE5' : '#FEE2E2', 
                            device.available ? '#065F46' : '#991B1B'
                          )}>
                            {device.available ? 'Available' : 'Not Available'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <motion.button 
                              whileHover={{ scale: 0.95 }} 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => editDevice(device)} 
                              style={styles.button('#DBEAFE', '#1E40AF', '#BFDBFE')}
                            >
                              ✏️ Edit
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 0.95 }} 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleAvailability(device)} 
                              style={styles.button('#FEF3C7', '#92400E', '#FDE68A')}
                            >
                              {device.available ? '⏸️ Unavailable' : '▶️ Available'}
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 0.95 }} 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteDevice(device.id)} 
                              style={styles.button('#FEE2E2', '#991B1B', '#FECACA')}
                            >
                              🗑️ Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && !loading && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '20px' }}>👥 User Management</h2>
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Orders</th>
                      <th style={styles.th}>Joined</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userItem => (
                      <motion.tr 
                        key={userItem.id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: '#F9FAFB' }}
                      >
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {userItem.photo && <img src={userItem.photo} alt={userItem.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />}
                            {userItem.name}
                          </div>
                        </td>
                        <td style={styles.td}>{userItem.email}</td>
                        <td style={styles.td}>{userItem.phone || 'N/A'}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(
                            userItem.role === 'admin' ? '#FEE2E2' : '#DBEAFE', 
                            userItem.role === 'admin' ? '#991B1B' : '#1E40AF'
                          )}>
                            {userItem.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badge('#E5E7EB', '#374151')}>{getUserOrders(userItem.id).length} orders</span>
                        </td>
                        <td style={styles.td}>{new Date(userItem.created_at).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <motion.button 
                            whileHover={{ scale: 0.95 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteUser(userItem.id)} 
                            disabled={userItem.role === 'admin'} 
                            style={styles.button('#FEE2E2', '#991B1B', '#FECACA')}
                          >
                            🗑️ Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && !loading && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '20px' }}>📦 Order Management</h2>
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Delivery Date</th>
                      <th style={styles.th}>Return Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const statusColors = {
                        completed: { bg: '#D1FAE5', color: '#065F46' },
                        delivered: { bg: '#DBEAFE', color: '#1E40AF' },
                        shipped: { bg: '#EDE9FE', color: '#5B21B6' },
                        confirmed: { bg: '#FEF3C7', color: '#92400E' },
                        pending: { bg: '#FEE2E2', color: '#991B1B' },
                        cancelled: { bg: '#F3F4F6', color: '#374151' }
                      };
                      const statusColor = statusColors[order.status] || statusColors.pending;
                      return (
                        <motion.tr 
                          key={order.id} 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: '#F9FAFB' }}
                        >
                          <td style={styles.td}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6B7280' }}>
                              {order.id.slice(0, 8)}...
                            </span>
                          </td>
                          <td style={styles.td}>{getUserName(order.user_id)}</td>
                          <td style={styles.td}>₹{order.total}</td>
                          <td style={styles.td}>
                            <span style={styles.badge(statusColor.bg, statusColor.color)}>{order.status}</span>
                          </td>
                          <td style={styles.td}>{new Date(order.delivery_date).toLocaleDateString()}</td>
                          <td style={styles.td}>{new Date(order.return_date).toLocaleDateString()}</td>
                          <td style={styles.td}>
                            <div style={styles.actionGroup}>
                              <select 
                                value={order.status} 
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)} 
                                style={{ ...styles.input, width: '110px', padding: '6px' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <motion.button 
                                whileHover={{ scale: 0.95 }} 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteOrder(order.id)} 
                                style={styles.button('#FEE2E2', '#991B1B', '#FECACA')}
                              >
                                🗑️
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Order Items Tab */}
          {activeTab === 'orderItems' && !loading && (
            <motion.div
              key="orderItems"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '20px' }}>🛒 Order Items Details</h2>
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Device</th>
                      <th style={styles.th}>Duration</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Order Status</th>
                      <th style={styles.th}>Order Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map(item => {
                      const statusColors = {
                        completed: { bg: '#D1FAE5', color: '#065F46' },
                        delivered: { bg: '#DBEAFE', color: '#1E40AF' },
                        shipped: { bg: '#EDE9FE', color: '#5B21B6' },
                        confirmed: { bg: '#FEF3C7', color: '#92400E' },
                        pending: { bg: '#FEE2E2', color: '#991B1B' },
                        cancelled: { bg: '#F3F4F6', color: '#374151' }
                      };
                      const statusColor = statusColors[item.orders?.status] || statusColors.pending;
                      return (
                        <motion.tr 
                          key={item.id} 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: '#F9FAFB' }}
                        >
                          <td style={styles.td}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6B7280' }}>
                              {item.order_id.slice(0, 8)}...
                            </span>
                          </td>
                          <td style={styles.td}>{item.devices?.name || 'Unknown Device'}</td>
                          <td style={styles.td}>{item.rental_duration} days</td>
                          <td style={styles.td}>₹{item.price}</td>
                          <td style={styles.td}>
                            <span style={styles.badge(statusColor.bg, statusColor.color)}>{item.orders?.status || 'Unknown'}</span>
                          </td>
                          <td style={styles.td}>{new Date(item.created_at).toLocaleDateString()}</td>
                          <td style={styles.td}>
                            <motion.button 
                              whileHover={{ scale: 0.95 }} 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteOrderItem(item.id)} 
                              style={styles.button('#FEE2E2', '#991B1B', '#FECACA')}
                            >
                              🗑️ Delete
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && !loading && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.tableCard}>
                <h3 style={styles.sectionTitle}>📊 Order Status Distribution</h3>
                {Object.entries(orders.reduce((acc, order) => {
                  acc[order.status] = (acc[order.status] || 0) + 1;
                  return acc;
                }, {})).map(([status, count]) => (
                  <motion.div 
                    key={status} 
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{status}:</span>
                    <span style={styles.badge('#667eea', 'white')}>{count}</span>
                  </motion.div>
                ))}
              </div>

              <div style={{ ...styles.tableCard, marginTop: '20px' }}>
                <h3 style={styles.sectionTitle}>📝 Recent Activity</h3>
                {orders.slice(0, 5).map((order, index) => (
                  <motion.div 
                    key={order.id} 
                    style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div><strong>{getUserName(order.user_id)}</strong> placed an order</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>₹{order.total} • {new Date(order.created_at).toLocaleString()}</div>
                  </motion.div>
                ))}
              </div>

              <div style={styles.quickActionsCard}>
                <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (window.confirm('⚠️ Delete ALL pending orders? This cannot be undone!')) {
                        orders.filter(o => o.status === 'pending').forEach(o => deleteOrder(o.id));
                      }
                    }} 
                    style={styles.button('#FEE2E2', '#991B1B', '#FECACA')}
                  >
                    🗑️ Delete All Pending Orders
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (window.confirm('⚠️ Delete ALL cancelled orders? This cannot be undone!')) {
                        orders.filter(o => o.status === 'cancelled').forEach(o => deleteOrder(o.id));
                      }
                    }} 
                    style={styles.button('#FEF3C7', '#92400E', '#FDE68A')}
                  >
                    🗑️ Delete All Cancelled Orders
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;