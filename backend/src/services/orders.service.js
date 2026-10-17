import { supabase } from '../config/supabase.js';
import { db } from '../db/database.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/orderStatus.js';

class OrdersService {
  /**
   * Create a new customer order
   */
  async createOrder(orderData) {
    const orderId = orderData.id || 'ORD-' + Date.now().toString(36).toUpperCase();

    const newOrderPayload = {
      id: orderId,
      customer_name: orderData.customer_name || orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      pincode: orderData.pincode,
      notes: orderData.notes || '',
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      delivery_fee: Number(orderData.delivery_fee ?? orderData.deliveryFee ?? 0),
      grand_total: Number(orderData.grand_total ?? orderData.grandTotal ?? 0),
      status: ORDER_STATUS.NEW,
      payment_status: orderData.payment_status || PAYMENT_STATUS.PENDING,
      payment_method: orderData.payment_method || orderData.paymentMethod || 'UPI',
      courier_name: orderData.courier_name || orderData.courierName || null,
      estimated_delivery: orderData.estimated_delivery || orderData.estimatedDelivery || null,
      tracking_number: null,
      payment_screenshot: orderData.payment_screenshot || null,
      created_at: new Date().toISOString()
    };

    // 1. Save in Live Database (Persistent in backend/data/db.json)
    db.saveOrder(newOrderPayload);

    // 2. Sync to Supabase PostgreSQL table 'orders'
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([newOrderPayload])
          .select();

        if (!error && data && data.length > 0) {
          db.saveOrder(data[0]);
          return data[0];
        }
      } catch (err) {
        console.warn('[OrdersService] Supabase insert warning:', err.message);
      }
    }

    return newOrderPayload;
  }

  /**
   * Retrieve all orders with optional filters (status, search query, limit, offset)
   */
  async getAllOrders({ status, search, limit = 50, offset = 0 } = {}) {
    // 1. Fetch from Supabase
    if (supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== 'All') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          data.forEach(o => db.saveOrder(o));
          let list = data;
          if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter(o => 
              (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
              (o.phone && o.phone.includes(q)) ||
              (o.id && String(o.id).toLowerCase().includes(q))
            );
          }
          return list;
        }
      } catch (err) {}
    }

    // 2. Fetch from Live Database
    return db.getOrders({ status, search });
  }

  /**
   * Get single order by ID
   */
  async getOrderById(orderId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {}
    }

    const all = db.getOrders();
    const found = all.find(o => String(o.id) === String(orderId));
    if (!found) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Order #${orderId} not found`);
    }
    return found;
  }

  /**
   * Update an order (status, payment_status, courier_name, tracking_number)
   */
  async updateOrder(orderId, updates) {
    const allowedFields = ['status', 'payment_status', 'courier_name', 'tracking_number', 'notes', 'payment_screenshot'];
    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No valid update fields provided');
    }

    // 1. Update in Live Database
    const existing = await this.getOrderById(orderId);
    const updated = { ...existing, ...filteredUpdates, updated_at: new Date().toISOString() };
    db.saveOrder(updated);

    // 2. Sync to Supabase
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update(filteredUpdates)
          .eq('id', orderId);
      } catch (err) {}
    }

    return updated;
  }

  /**
   * Calculate aggregated dashboard metrics
   */
  async getOrderStats() {
    const all = await this.getAllOrders({ limit: 1000 });
    
    const stats = {
      totalOrders: all.length,
      newOrders: all.filter(o => o.status === ORDER_STATUS.NEW).length,
      preparingOrders: all.filter(o => o.status === ORDER_STATUS.PREPARING).length,
      dispatchedOrders: all.filter(o => o.status === ORDER_STATUS.DISPATCHED).length,
      deliveredOrders: all.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
      cancelledOrders: all.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
      totalRevenue: all.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0),
      paidOrders: all.filter(o => o.payment_status === PAYMENT_STATUS.PAID).length,
      pendingPayments: all.filter(o => o.payment_status === PAYMENT_STATUS.PENDING).length
    };

    return stats;
  }

  /**
   * Delete single order by ID
   */
  async deleteOrder(orderId) {
    if (supabase) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (err) {}
    }
    const removed = db.deleteOrder(orderId);
    return removed;
  }

  /**
   * Clear all orders (e.g. remove test orders)
   */
  async clearOrders() {
    if (supabase) {
      try {
        await supabase.from('orders').delete().neq('id', 'NONE');
      } catch (err) {}
    }
    db.clearOrders();
    return true;
  }
}

export const ordersService = new OrdersService();
