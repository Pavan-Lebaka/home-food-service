/**
 * Brand Configuration & Dynamic Storefront URL Resolver
 */

export const getStorefrontUrl = () => {
  // If explicitly configured for production (and not pointing to localhost)
  if (import.meta.env.VITE_STOREFRONT_URL && !import.meta.env.VITE_STOREFRONT_URL.includes('localhost')) {
    return import.meta.env.VITE_STOREFRONT_URL;
  }

  // If running in browser environment, check current hostname dynamically
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return import.meta.env.VITE_DEV_STOREFRONT_URL || 'http://localhost:5173';
    }
  }

  // Production Netlify Storefront URL
  return 'https://bramarambika-home-food.netlify.app';
};

export const BRAND_INFO = {
  name: 'Bramarambika Home Foods',
  tagline: 'Traditional Telugu Taste • Homemade with Love',
  whatsappNumber: '7793910819',
  get storefrontUrl() {
    return getStorefrontUrl();
  }
};
