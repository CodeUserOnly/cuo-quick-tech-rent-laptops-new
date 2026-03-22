import React, { useState } from 'react';
import { loadRazorpayScript, createRazorpayOrder, verifyRazorpayPayment } from '../services/razorpayService';

const RazorpayPayment = ({ 
  amount, 
  userDetails, 
  onSuccess, 
  onFailure,
  orderItems 
}) => {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        onFailure('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      // Create order on backend
      const order = await createRazorpayOrder(amount);

      // Prepare order items for notes
      const itemsSummary = orderItems.map(item => 
        `${item.name} (${item.rentalDuration} days)`
      ).join(', ');

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Quick Tech Rent',
        description: `Rental Payment - ${orderItems.length} item(s)`,
        image: 'https://quick-tech-rent-001.netlify.app/logo192.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment signature
            const verificationResult = await verifyRazorpayPayment({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verificationResult.success) {
              onSuccess({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: amount
              });
            } else {
              onFailure('Payment verification failed');
            }
          } catch (error) {
            onFailure('Payment verification failed: ' + error.message);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: userDetails?.fullName || userDetails?.name || '',
          email: userDetails?.email || '',
          contact: userDetails?.phone || ''
        },
        notes: {
          address: userDetails?.address || 'No address provided',
          items: itemsSummary,
          user_id: userDetails?.id || ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            onFailure('Payment cancelled by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response) {
        setProcessing(false);
        onFailure(response.error.description || 'Payment failed');
      });

    } catch (error) {
      setProcessing(false);
      onFailure(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={processing}
        className="btn btn-primary btn-lg w-100"
        style={{
          background: processing ? '#ccc' : '#3399cc',
          cursor: processing ? 'not-allowed' : 'pointer',
          padding: '12px',
          fontSize: '18px',
          fontWeight: '600',
          border: 'none',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        {processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Processing...
          </>
        ) : (
          `Pay ₹${amount.toFixed(2)} via Razorpay`
        )}
      </button>

      <div className="mt-3 text-center">
        <small className="text-muted">
          🔒 Secure payment powered by Razorpay
        </small>
      </div>
    </div>
  );
};

export default RazorpayPayment;