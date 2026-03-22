// import React from 'react';
// import { createRazorpayOrder, verifyPayment } from '../services/razorpayService';

// const RazorpayCheckout = ({ amount, onSuccess, onFailure, userDetails }) => {
//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handlePayment = async () => {
//     try {
//       // Load Razorpay script
//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         alert('Failed to load Razorpay SDK. Please check your internet connection.');
//         return;
//       }

//       // Create order on backend
//       const order = await createRazorpayOrder(amount);

//       // Razorpay checkout options
//       const options = {
//         key: process.env.REACT_APP_RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: order.currency,
//         name: 'Quick Tech Rent',
//         description: 'Laptop Rental Payment',
//         image: 'https://quick-tech-rent-001.netlify.app/logo192.png', // Your logo URL
//         order_id: order.id,
//         handler: async function (response) {
//           // Verify payment signature
//           const verificationResult = await verifyPayment({
//             order_id: response.razorpay_order_id,
//             payment_id: response.razorpay_payment_id,
//             signature: response.razorpay_signature
//           });

//           if (verificationResult.success) {
//             // Payment successful
//             onSuccess({
//               orderId: response.razorpay_order_id,
//               paymentId: response.razorpay_payment_id,
//               amount: amount
//             });
//           } else {
//             onFailure('Payment verification failed');
//           }
//         },
//         prefill: {
//           name: userDetails?.name || '',
//           email: userDetails?.email || '',
//           contact: userDetails?.phone || ''
//         },
//         notes: {
//           address: 'Quick Tech Rent - Laptop Rental'
//         },
//         theme: {
//           color: '#3399cc'
//         }
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();

//       razorpay.on('payment.failed', function (response) {
//         onFailure(response.error.description || 'Payment failed');
//       });

//     } catch (error) {
//       console.error('Payment error:', error);
//       onFailure(error.message || 'Something went wrong');
//     }
//   };

//   return (
//     <button 
//       onClick={handlePayment}
//       className="btn btn-primary btn-lg w-100"
//     >
//       Pay ₹{amount} via Razorpay
//     </button>
//   );
// };

// export default RazorpayCheckout;