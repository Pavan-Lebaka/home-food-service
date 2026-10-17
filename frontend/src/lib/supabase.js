import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

/**
 * Saves a new customer order into the Supabase 'orders' table
 */
export async function saveOrderToDatabase(orderData) {
  if (!supabase) return { success: false, error: 'Supabase client not configured' };
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: orderData.name,
          phone: orderData.phone,
          address: orderData.address,
          pincode: orderData.pincode,
          notes: orderData.notes || '',
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          grand_total: orderData.grandTotal,
          status: 'New',
          payment_status: 'Pending'
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase saveOrder error:', error);
      return { success: false, error };
    }
    return { success: true, order: data && data[0] };
  } catch (err) {
    console.warn('Failed to save order to database:', err);
    return { success: false, error: err };
  }
}


