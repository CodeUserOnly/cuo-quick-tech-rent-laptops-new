import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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

  // Fetch all data - MOVED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersData = await usersService.getAll();
      setUsers(usersData);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!ordersError) setOrders(ordersData || []);

      // Fetch order items with device details
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

  // Redirect if not admin - MOVED AFTER ALL HOOKS
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

      console.log('Saving device data:', deviceData);

      if (editingDevice) {
        // Update existing device
        console.log('Updating device ID:', editingDevice.id);
        await updateDevice(editingDevice.id, deviceData);
      } else {
        // Add new device
        console.log('Adding new device');
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
      const updatedDevice = { 
        ...device, 
        available: !device.available 
      };
      await updateDevice(device.id, updatedDevice);
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability');
    }
  };

  const editDevice = (device) => {
    console.log('Editing device:', device);
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
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
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

  // Delete order permanently
  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order permanently? This action cannot be undone and will also delete all associated order items.')) {
      try {
        // First delete associated order items
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId);

        if (itemsError) {
          throw new Error(`Failed to delete order items: ${itemsError.message}`);
        }

        // Then delete the order
        const { error: orderError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (orderError) {
          throw new Error(`Failed to delete order: ${orderError.message}`);
        }

        // Update local state
        setOrders(prev => prev.filter(order => order.id !== orderId));
        setOrderItems(prev => prev.filter(item => item.order_id !== orderId));
        
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert(`Failed to delete order: ${error.message}`);
      }
    }
  };

  // Delete order item permanently
  const deleteOrderItem = async (orderItemId) => {
    if (window.confirm('Are you sure you want to delete this order item permanently? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('order_items')
          .delete()
          .eq('id', orderItemId);

        if (error) {
          throw new Error(`Failed to delete order item: ${error.message}`);
        }

        // Update local state
        setOrderItems(prev => prev.filter(item => item.id !== orderItemId));
        
        alert('Order item deleted successfully!');
      } catch (error) {
        console.error('Error deleting order item:', error);
        alert(`Failed to delete order item: ${error.message}`);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersService.delete(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Statistics
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getUserOrders = (userId) => {
    return orders.filter(order => order.user_id === userId);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <h1>Admin Dashboard</h1>
          <p className="lead">Complete management system for your laptop rental business</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h4>{devices.length}</h4>
              <p>Total Devices</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h4>{totalUsers}</h4>
              <p>Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h4>{totalOrders}</h4>
              <p>Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h4>₹{totalRevenue.toFixed(2)}</h4>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            📱 Devices
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orderItems' ? 'active' : ''}`}
            onClick={() => setActiveTab('orderItems')}
          >
            🛒 Order Items
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </li>
      </ul>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div>
          <div className="d-flex justify-content-between mb-4">
            <h2>Laptop Inventory</h2>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
              disabled={saving}
            >
              {showAddForm ? 'Cancel' : 'Add New Laptop'}
            </button>
          </div>

          {(showAddForm || editingDevice) && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {editingDevice ? `Edit Laptop: ${editingDevice.name}` : 'Add New Laptop'}
                </h4>
                {editingDevice && (
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Brand *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="brand"
                        value={formData.brand}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price per Day (₹) *</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        step="0.01"
                        min="0"
                        required 
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Image URL *</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        name="image"
                        value={formData.image}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Availability</label>
                      <div className="form-check mt-2">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="available"
                          checked={formData.available}
                          onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                          disabled={saving}
                        />
                        <label className="form-check-label">
                          Available for rental
                        </label>
                      </div>
                    </div>
                  </div>
                  <h5 className="mt-3">Specifications</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Processor *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="processor"
                        value={formData.processor}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">RAM *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="ram"
                        value={formData.ram}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Storage *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="storage"
                        value={formData.storage}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Display *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="display"
                        value={formData.display}
                        onChange={handleFormChange}
                        required 
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Graphics *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="graphics"
                      value={formData.graphics}
                      onChange={handleFormChange}
                      required 
                      disabled={saving}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {editingDevice ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingDevice ? 'Update Laptop' : 'Add Laptop'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Price/Day</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(device => (
                  <tr key={device.id}>
                    <td>{device.name}</td>
                    <td>{device.brand}</td>
                    <td>₹{device.price}</td>
                    <td>{device.location}</td>
                    <td>
                      <span className={`badge ${device.available ? 'bg-success' : 'bg-danger'}`}>
                        {device.available ? 'Available' : 'Not Available'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => editDevice(device)}
                          title="Edit Device"
                          disabled={saving}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => toggleAvailability(device)}
                          title={device.available ? 'Make Unavailable' : 'Make Available'}
                          disabled={saving}
                        >
                          {device.available ? '⏸️ Unavailable' : '▶️ Available'}
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteDevice(device.id)}
                          title="Delete Device"
                          disabled={saving}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {devices.length === 0 && (
            <div className="text-center py-5">
              <h3>No laptops in inventory</h3>
              <p>Add your first laptop to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 className="mb-4">User Management</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {user.photo && (
                          <img 
                            src={user.photo} 
                            alt={user.name}
                            className="rounded-circle me-2"
                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                          />
                        )}
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {getUserOrders(user.id).length} orders
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteUser(user.id)}
                        disabled={user.role === 'admin'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="mb-4">Order Management</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Return Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="text-muted small">{order.id.slice(0, 8)}...</td>
                    <td>{getUserName(order.user_id)}</td>
                    <td>₹{order.total}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'completed' ? 'bg-success' :
                        order.status === 'pending' ? 'bg-warning' :
                        order.status === 'cancelled' ? 'bg-danger' : 'bg-info'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.delivery_date).toLocaleDateString()}</td>
                    <td>{new Date(order.return_date).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <select 
                          className="form-select form-select-sm me-1"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{ width: '120px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteOrder(order.id)}
                          title="Delete Order Permanently"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Items Tab */}
      {activeTab === 'orderItems' && (
        <div>
          <h2 className="mb-4">Order Items Details</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Device</th>
                  <th>Rental Duration</th>
                  <th>Price</th>
                  <th>Order Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map(item => (
                  <tr key={item.id}>
                    <td className="text-muted small">{item.order_id.slice(0, 8)}...</td>
                    <td>
                      {item.devices?.name || 'Unknown Device'} 
                      {item.devices?.brand && ` (${item.devices.brand})`}
                    </td>
                    <td>{item.rental_duration} days</td>
                    <td>₹{item.price}</td>
                    <td>
                      <span className={`badge ${
                        item.orders?.status === 'completed' ? 'bg-success' :
                        item.orders?.status === 'pending' ? 'bg-warning' :
                        item.orders?.status === 'cancelled' ? 'bg-danger' : 'bg-info'
                      }`}>
                        {item.orders?.status || 'Unknown'}
                      </span>
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteOrderItem(item.id)}
                        title="Delete Order Item Permanently"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <h2 className="mb-4">Business Analytics</h2>
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Order Status Distribution</h5>
                </div>
                <div className="card-body">
                  {Object.entries(orders.reduce((acc, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                    return acc;
                  }, {})).map(([status, count]) => (
                    <div key={status} className="d-flex justify-content-between mb-2">
                      <span className="text-capitalize">{status}:</span>
                      <span className="badge bg-primary">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Recent Activity</h5>
                </div>
                <div className="card-body">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="mb-2 p-2 border rounded">
                      <div className="small">
                        <strong>{getUserName(order.user_id)}</strong> placed an order
                      </div>
                      <div className="small text-muted">
                        ₹{order.total} • {new Date(order.created_at).toLocaleString()}
                      </div>
                      <div className="mt-1">
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteOrder(order.id)}
                        >
                          Delete Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Section */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5>Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete ALL pending orders? This action cannot be undone!')) {
                          const pendingOrders = orders.filter(order => order.status === 'pending');
                          pendingOrders.forEach(order => deleteOrder(order.id));
                        }
                      }}
                    >
                      Delete All Pending Orders
                    </button>
                    <button 
                      className="btn btn-outline-warning"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete ALL cancelled orders? This action cannot be undone!')) {
                          const cancelledOrders = orders.filter(order => order.status === 'cancelled');
                          cancelledOrders.forEach(order => deleteOrder(order.id));
                        }
                      }}
                    >
                      Delete All Cancelled Orders
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;