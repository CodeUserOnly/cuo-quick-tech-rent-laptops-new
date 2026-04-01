import { supabase } from '../../supabase/client'

export const ordersService = {
  create: async (orderData) => {
    console.log('Creating order with data:', orderData); // Debug log
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id,
        total: orderData.total,
        status: orderData.status || 'pending',
        delivery_address: orderData.delivery_address,
        delivery_date: orderData.delivery_date,
        return_date: orderData.return_date,
        rental_days: orderData.rental_days || null,
        payment_method: orderData.payment_method || 'cod', // Add payment method
        payment_status: orderData.payment_status || 'pending', // Add payment status
        payment_date: orderData.payment_date || null, // Add payment date
        razorpay_order_id: orderData.razorpay_order_id || null, // Add Razorpay order ID
        razorpay_payment_id: orderData.razorpay_payment_id || null // Add Razorpay payment ID
      }])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    console.log('Order created successfully:', order); // Debug log

    // Create order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        device_id: item.device_id,
        rental_duration: item.rental_duration,
        price: item.price,
        total_price: item.total_price || (item.price * item.rental_duration) // Add total price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }
      
      console.log('Order items created successfully'); // Debug log
    }

    return order;
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          devices (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          devices (*)
        ),
        users (name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  update: async (id, orderData) => {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
