import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchProductsApi } from '../lib/api';
import { CATEGORIES as DEFAULT_CATEGORIES, FEATURED_COLLECTIONS as DEFAULT_COLLECTIONS, BRAND_INFO, PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLiveProducts = useCallback(async () => {
    try {
      const data = await fetchProductsApi();
      if (data && Array.isArray(data) && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('[ProductsContext] API offline, using authentic fallback products:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadLiveProducts();
  }, [loadLiveProducts]);

  const value = {
    products,
    loading,
    error,
    refreshProducts: loadLiveProducts,
    categories: DEFAULT_CATEGORIES,
    featuredCollections: DEFAULT_COLLECTIONS,
    brandInfo: BRAND_INFO
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
