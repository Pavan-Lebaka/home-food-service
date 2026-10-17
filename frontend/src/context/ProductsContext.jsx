import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchProductsApi } from '../lib/api';
import { CATEGORIES as DEFAULT_CATEGORIES, FEATURED_COLLECTIONS as DEFAULT_COLLECTIONS, BRAND_INFO } from '../data/products';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLiveProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsApi();
      if (data && Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to fetch if empty
        const retryData = await fetchProductsApi();
        if (retryData && retryData.length > 0) {
          setProducts(retryData);
        }
      }
    } catch (err) {
      console.error('[ProductsContext] Error loading live products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
