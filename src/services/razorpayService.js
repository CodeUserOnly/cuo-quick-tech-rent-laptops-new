import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const createRazorpayOrder = async (amount) => {
  try {
    const response = await axios.post(`${API_URL}/create-order`, {
      amount: amount,
      currency: 'INR'
    });
    
    if (response.data.success) {
      return response.data.order;
    } else {
      throw new Error('Failed to create order');
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_URL}/verify-payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};