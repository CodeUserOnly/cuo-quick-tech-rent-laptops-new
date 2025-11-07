import React from 'react';
import { Link } from 'react-router-dom';

const ShoppingCart = ({ cart, updateCartItemDuration, removeFromCart }) => {
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.rentalDuration), 0);

  if (cart.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <h2>Your Cart is Empty</h2>
          <p className="lead mb-4">Add some laptops to your cart to get started.</p>
          <Link to="/browse" className="btn btn-primary btn-lg">Browse Laptops</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>Shopping Cart</h1>
      <p className="lead">Review your rental selections</p>

      <div className="row">
        <div className="col-md-8">
          {cart.map(item => (
            <div key={item.cartItemId} className="cart-item card mb-3 p-3"> {/* CHANGED: key={item.cartItemId} */}
              <div className="row">
                <div className="col-md-3">
                  <img src={item.image} alt={item.name} className="img-fluid rounded" />
                </div>
                <div className="col-md-6">
                  <h5>{item.name}</h5>
                  <p className="text-muted">{item.brand}</p>
                  <div className="specs">
                    <small>{item.specs.processor} • {item.specs.ram} • {item.specs.storage}</small>
                  </div>
                  <div className="mt-2">
                    <span className="text-primary fw-bold">₹{item.price}/day</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor={`duration-${item.cartItemId}`} className="form-label">Days</label> {/* CHANGED: id uses cartItemId */}
                    <input 
                      type="number" 
                      className="form-control" 
                      id={`duration-${item.cartItemId}`}
                      min="1" 
                      max="30" 
                      value={item.rentalDuration}
                      onChange={(e) => updateCartItemDuration(item.id, parseInt(e.target.value))}
                    />
                  </div>
                  <div className="mb-2">
                    <strong>Subtotal: ₹{item.price * item.rentalDuration}</strong>
                  </div>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-4">
          <div className="cart-summary card p-3">
            <h4>Order Summary</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Delivery Fee:</span>
              <span>₹0.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Tax:</span>
              <span>₹{(totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-3">
              <strong>Total:</strong>
              <strong>₹{(totalPrice * 1.1).toFixed(2)}</strong>
            </div>
            <div className="d-grid gap-2">
              <Link to="/checkout" className="btn btn-primary btn-lg">
                Proceed to Checkout
              </Link>
              <Link to="/browse" className="btn btn-outline-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;