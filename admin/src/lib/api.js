import { supabase, fetchAllOrders as fetchSupabaseOrders, updateOrder as updateSupabaseOrder } from './supabase';

const rawBackendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

/**
 * Token management
 */
export function getAdminToken() {
  return localStorage.getItem('bramarambika_admin_token') || '';
}

export function setAdminSession(token, user) {
  if (token) {
    localStorage.setItem('bramarambika_admin_token', token);
  }
  if (user) {
    localStorage.setItem('bramarambika_admin_user', JSON.stringify(user));
  }
}

export function clearAdminSession() {
  localStorage.removeItem('bramarambika_admin_token');
  localStorage.removeItem('bramarambika_admin_user');
}

export function getStoredAdminUser() {
  try {
    const raw = localStorage.getItem('bramarambika_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Admin Login
 */
export async function loginAdminApi(email, password) {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      setAdminSession(data.data.token, data.data.user);
      return { success: true, user: data.data.user, token: data.data.token };
    }

    if (data.message) {
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.warn('[API] Backend unreachable, trying Supabase fallback...', err);
  }

  // Supabase fallback
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) return { success: false, error: error.message };

      if (data?.user) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
          isAdmin: true
        };
        setAdminSession(data.session?.access_token || 'supabase_token', user);
        return { success: true, user };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Login failed. Please check your credentials.' };
}

/**
 * Orders Management
 */
export async function fetchOrdersApi(statusFilter = 'All', searchQuery = '') {
  const token = getAdminToken();

  try {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
    if (searchQuery) params.append('search', searchQuery);

    const response = await fetch(`${BACKEND_URL}/orders?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('[API] Backend orders unreachable, falling back to Supabase...', err);
  }

  return fetchSupabaseOrders();
}

export async function updateOrderApi(orderId, updates) {
  const token = getAdminToken();

  try {
    const response = await fetch(`${BACKEND_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('[API] Backend updateOrder unreachable, falling back to Supabase...', err);
  }

  return updateSupabaseOrder(orderId, updates);
}

export async function deleteOrderApi(orderId) {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.success;
    }
  } catch (err) {
    console.warn('[API] Backend deleteOrder error:', err);
  }
  return false;
}

export async function clearAllOrdersApi() {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/orders/clear/all`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.success;
    }
  } catch (err) {
    console.warn('[API] Backend clearAllOrders error:', err);
  }
  return false;
}

/**
 * Dish Photo Upload API
 * Takes base64 data URL and uploads to Cloudinary CDN, returning permanent HTTPS image URL
 */
export async function uploadDishImageApi(dataUrl, dishName = 'dish') {
  try {
    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: dataUrl,
        name: dishName
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data?.url) {
        return result.data.url;
      }
    }
  } catch (err) {
    console.warn('[API] Image upload to server failed, using local format:', err);
  }
  return dataUrl;
}

/**
 * Product Catalog Management
 */
export async function fetchProductsApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.inStock !== undefined && filters.inStock !== null) params.append('inStock', filters.inStock);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${BACKEND_URL}/products?${params.toString()}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
    }
  } catch (err) {
    console.error('[API] Failed to fetch products:', err);
  }
  return [];
}

export async function updateProductApi(id, updates) {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) return result.data;
    }
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to update product');
  } catch (err) {
    console.error('[API] Error updating product:', err);
    throw err;
  }
}

export async function createProductApi(productData) {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) return result.data;
    }
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to create product');
  } catch (err) {
    console.error('[API] Error creating product:', err);
    throw err;
  }
}

export async function deleteProductApi(id) {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) return true;
    }
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to delete product');
  } catch (err) {
    console.error('[API] Error deleting product:', err);
    throw err;
  }
}

export async function seedProductsApi() {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/products/seed/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) return result.data;
    }
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to seed products');
  } catch (err) {
    console.error('[API] Error seeding products:', err);
    throw err;
  }
}

/**
 * Shiprocket Courier Operations
 */
export async function createShipmentApi(order) {
  const token = getAdminToken();
  const payload = typeof order === 'object' ? order : { orderId: order };
  try {
    const response = await fetch(`${BACKEND_URL}/shipping/shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to book shipment');
    }
    return data;
  } catch (err) {
    console.error('[API] Shiprocket create shipment error:', err);
    throw err;
  }
}

export async function trackShipmentApi(awbCode) {
  const token = getAdminToken();
  try {
    const response = await fetch(`${BACKEND_URL}/shipping/track/${awbCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[API] Shiprocket track shipment error:', err);
    throw err;
  }
}
