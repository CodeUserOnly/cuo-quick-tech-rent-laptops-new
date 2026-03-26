import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactDOM from 'react-dom';

const Toast = ({ show, message, duration, price, onClose }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <motion.div
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring", damping: 20 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999999,
        maxWidth: '400px',
        width: '90%',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)',
        borderLeft: '4px solid #10b981',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1 }}
            style={{
              width: '40px',
              height: '40px',
              background: '#D1FAE5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              🛒
            </motion.span>
          </motion.div>
          <div style={{ flex: 1 }}>
            <motion.h4 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1F2937' }}
            >
              Added to Cart!
            </motion.h4>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}
            >
              {message}
            </motion.p>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#10b981', fontWeight: 500 }}
            >
              {duration} days • ₹{price}
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '4px',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </motion.button>
        </div>
        
        {/* View Cart Button */}
        <Link to="/cart" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: '#5a67d8' }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: '12px',
              background: '#667eea',
              borderRadius: '12px',
              padding: '10px',
              textAlign: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            View Cart →
          </motion.div>
        </Link>
        
        {/* Progress bar for auto-dismiss */}
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 3, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: '#10b981',
          }}
        />
      </div>
    </motion.div>,
    document.body
  );
};

export default Toast;