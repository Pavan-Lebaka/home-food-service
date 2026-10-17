import { supabase, saveOrderToDatabase } from './supabase';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

/**
 * Fetch all live products from Backend API
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
    console.warn('[API] Backend unreachable, serving local fallback:', err);
  }
  return null;
}

/**
 * Create a new customer order (Dispatches to Backend with Supabase fallback)
 */
export async function createOrderApi(orderData) {
  try {
    const response = await fetch(`${BACKEND_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return { success: true, order: result.data };
      }
    }
  } catch (err) {
    console.warn('[API] Backend unreachable, falling back to direct Supabase save:', err);
  }

  return saveOrderToDatabase(orderData);
}

/**
 * Check Courier Serviceability & Shipping Rates via Shiprocket
 */
export async function checkShiprocketRates(pincode) {
  try {
    const response = await fetch(`${BACKEND_URL}/shipping/serviceability/${pincode}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('[API] Failed to fetch shipping rates:', err);
  }
  return null;
}
