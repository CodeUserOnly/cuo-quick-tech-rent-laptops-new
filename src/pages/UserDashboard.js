import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../services/supabase';
import { supabase } from '../supabase/client';

const UserDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (user && user.id) {
        try {
          console.log('Loading orders for user:', user.id);
          const userOrders = await ordersService.getByUserId(user.id);
          console.log('Orders loaded:', userOrders);
          setOrders(userOrders);
        } catch (error) {
          console.error('Error loading orders:', error);
          // Fallback to localStorage
          const savedOrders = localStorage.getItem('orders');
          if (savedOrders) {
            const parsedOrders = JSON.parse(savedOrders);
            // Filter orders for current user
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

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active':
        return ['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status);
      case 'completed':
        return order.status === 'completed';
      case 'cancelled':
        return order.status === 'cancelled';
      default:
        return true;
    }
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((total, order) => total + parseFloat(order.total || 0), 0);
  const completedRentals = orders.filter(order => order.status === 'completed' || order.status === 'delivered').length;
  const activeRentals = orders.filter(order => ['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status)).length;

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(null);
    }
  };

  // Delete order permanently
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order permanently? This action cannot be undone and all order data will be lost.')) {
      return;
    }

    setDeletingOrder(orderId);
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
      
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`Failed to delete order: ${error.message}`);
    } finally {
      setDeletingOrder(null);
    }
  };

  // Check if order can be cancelled (only pending or confirmed orders)
  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  // Check if order can be deleted (only cancelled or completed orders)
  const canDeleteOrder = (order) => {
    return ['cancelled', 'completed'].includes(order.status);
  };

  // Calculate days until return
  const getDaysUntilReturn = (returnDate) => {
    if (!returnDate) return null;
    const today = new Date();
    const returnDay = new Date(returnDate);
    const diffTime = returnDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'delivered':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'confirmed':
        return 'bg-secondary';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Get status description
  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Your order is being processed';
      case 'confirmed':
        return 'Order confirmed, preparing for shipment';
      case 'shipped':
        return 'Your laptop is on the way';
      case 'delivered':
        return 'Laptop delivered, in use';
      case 'completed':
        return 'Rental period completed';
      case 'cancelled':
        return 'Order was cancelled';
      default:
        return 'Order processing';
    }
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Please log in to view your dashboard</h4>
          <Link to="/login" className="btn btn-primary mt-3">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <h1>User Dashboard</h1>
          <p className="lead">Welcome back, {user.name}!</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h3>₹{totalSpent.toFixed(2)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-info text-white">
            <div className="card-body">
              <h3>{activeRentals}</h3>
              <p>Active Rentals</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-warning">
            <div className="card-body">
              <Link to="/browse" className="btn btn-dark">
                Rent New Laptop
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Your Orders</h3>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active ({activeRentals})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'completed' ? 'btn-info' : 'btn-outline-info'}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed ({completedRentals})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'cancelled' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Cancelled ({orders.filter(o => o.status === 'cancelled').length})
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Devices</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Return Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => {
                        const daysUntilReturn = getDaysUntilReturn(order.return_date);
                        return (
                          <tr key={order.id}>
                            <td>
                              <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                            </td>
                            <td>
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td>
                              {order.order_items && order.order_items.length > 0 ? (
                                <div>
                                  {order.order_items.map((item, index) => (
                                    <div key={index} className="small">
                                      <strong>{item.devices?.name || 'Device'}</strong>
                                      <br />
                                      <span className="text-muted">
                                        {item.rental_duration} days • ₹{item.price}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">No items</span>
                              )}
                            </td>
                            <td>
                              <strong>₹{parseFloat(order.total || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <div>
                                <span className={`badge ${getStatusBadge(order.status)}`}>
                                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                </span>
                                <div className="small text-muted mt-1">
                                  {getStatusDescription(order.status)}
                                </div>
                                {daysUntilReturn !== null && daysUntilReturn > 0 && order.status === 'delivered' && (
                                  <div className="small text-warning mt-1">
                                    {daysUntilReturn} days until return
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              {order.return_date ? (
                                <div>
                                  {new Date(order.return_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                  {daysUntilReturn !== null && daysUntilReturn < 3 && order.status === 'delivered' && (
                                    <div className="small text-danger">
                                      Due soon!
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">Not set</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group-vertical btn-group-sm">
                                {canCancelOrder(order) && (
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => cancelOrder(order.id)}
                                    disabled={cancellingOrder === order.id}
                                    title="Cancel Order"
                                  >
                                    {cancellingOrder === order.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      '❌ Cancel'
                                    )}
                                  </button>
                                )}
                                {canDeleteOrder(order) && (
                                  <button
                                    className="btn btn-outline-danger btn-sm mt-1"
                                    onClick={() => deleteOrder(order.id)}
                                    disabled={deletingOrder === order.id}
                                    title="Delete Order Permanently"
                                  >
                                    {deletingOrder === order.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      '🗑️ Delete'
                                    )}
                                  </button>
                                )}
                                {order.status === 'delivered' && (
                                  <button
                                    className="btn btn-outline-info btn-sm mt-1"
                                    onClick={() => alert('Contact support for early return or extension.')}
                                    title="Manage Rental"
                                  >
                                    ⚙️ Manage
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-shopping-cart fa-3x text-muted"></i>
                  </div>
                  <h4>No {activeTab !== 'all' ? activeTab : ''} orders found</h4>
                  <p className="text-muted mb-4">
                    {activeTab === 'all' 
                      ? "Start browsing our laptops to make your first rental!" 
                      : `You don't have any ${activeTab} orders.`}
                  </p>
                  <Link to="/browse" className="btn btn-primary btn-lg">
                    Browse Laptops
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Rental Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h4 className="text-primary">{totalOrders}</h4>
                    <small className="text-muted">Total Rentals</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h4 className="text-success">{completedRentals}</h4>
                    <small className="text-muted">Completed</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h4 className="text-warning">{activeRentals}</h4>
                    <small className="text-muted">Active</small>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${totalOrders ? (completedRentals / totalOrders) * 100 : 0}%` }}
                  >
                    {Math.round((completedRentals / totalOrders) * 100)}%
                  </div>
                </div>
                <small className="text-muted">Completion Rate</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <Link to="/browse" className="btn btn-outline-primary w-100">
                    <i className="fas fa-laptop me-2"></i>
                    Rent New
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/cart" className="btn btn-outline-success w-100">
                    <i className="fas fa-shopping-cart me-2"></i>
                    View Cart
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/support" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-headset me-2"></i>
                    Support
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/about" className="btn btn-outline-info w-100">
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Management Tips */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Management Tips</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex">
                    <div className="me-3 text-warning">
                      <i className="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <div>
                      <h6>Cancellation</h6>
                      <p className="small text-muted mb-0">
                        You can cancel orders that are still in "Pending" or "Confirmed" status.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex">
                    <div className="me-3 text-danger">
                      <i className="fas fa-trash fa-2x"></i>
                    </div>
                    <div>
                      <h6>Deletion</h6>
                      <p className="small text-muted mb-0">
                        Only cancelled or completed orders can be permanently deleted from your history.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex">
                    <div className="me-3 text-info">
                      <i className="fas fa-clock fa-2x"></i>
                    </div>
                    <div>
                      <h6>Return Reminders</h6>
                      <p className="small text-muted mb-0">
                        Return dates are highlighted when due within 3 days to avoid late fees.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;