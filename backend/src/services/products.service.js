import { supabase } from '../config/supabase.js';
import { db } from '../db/database.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

class ProductsService {
  /**
   * Fetch all products from Live Database & Supabase
   */
  async getAllProducts({ category, inStock, search } = {}) {
    // 1. Check Supabase table first
    if (supabase) {
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: true });
        
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        if (inStock !== undefined && inStock !== null && inStock !== '') {
          query = query.eq('in_stock', inStock === 'true' || inStock === true);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data.map(this.mapDatabaseToProduct);
          if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter(p =>
              (p.name && p.name.toLowerCase().includes(q)) ||
              (p.teluguName && p.teluguName.toLowerCase().includes(q))
            );
          }
          return list;
        }
      } catch (err) {
        // Fallback to LiveDatabase
      }
    }

    // 2. Fetch from Live Database
    return db.getProducts({ category, inStock, search });
  }

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return this.mapDatabaseToProduct(data);
        }
      } catch (err) {}
    }

    const found = db.getProductById(id);
    if (!found) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Product #${id} not found in database`);
    }
    return found;
  }

  /**
   * Create a new product in DB & Supabase
   */
  async createProduct(productData) {
    const newId = productData.id || 
      productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const pricePerKg = Number(productData.pricePerKg || productData.price || 499);

    const productRecord = {
      id: newId,
      name: productData.name,
      teluguName: productData.teluguName || productData.telugu_name || '',
      category: productData.category || 'veg-pickles',
      categoryLabel: productData.categoryLabel || productData.category_label || 'Veg Pickles',
      pricePerKg,
      unit: productData.unit || 'kg',
      tagline: productData.tagline || '',
      description: productData.description || '',
      badge: productData.badge || '',
      image: productData.image || '/images/default-dish.jpg',
      taste: productData.taste || 'Traditional Andhra Flavour',
      rating: Number(productData.rating) || 5.0,
      reviewCount: Number(productData.reviewCount) || 10,
      inStock: productData.inStock !== false && productData.in_stock !== false,
      ingredients: productData.ingredients || '',
      variantPrices: productData.variantPrices || {
        '250g': Math.round(pricePerKg * 0.25 + 5),
        '500g': Math.round(pricePerKg * 0.5),
        '1kg': pricePerKg,
        '2kg': Math.round(pricePerKg * 2 * 0.95)
      }
    };

    // Save to LiveDatabase
    db.saveProduct(productRecord);

    // Sync to Supabase if table exists
    if (supabase) {
      try {
        const dbPayload = this.mapProductToDatabase(productRecord);
        await supabase.from('products').insert([dbPayload]);
      } catch (err) {}
    }

    return productRecord;
  }

  /**
   * Update product details or stock status in DB & Supabase
   */
  async updateProduct(id, updates) {
    const existing = db.getProductById(id) || {};
    const merged = { ...existing, ...updates, id };

    // 1. Update in LiveDatabase
    db.saveProduct(merged);

    // 2. Sync update to Supabase
    if (supabase) {
      try {
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.teluguName !== undefined) dbUpdates.telugu_name = updates.teluguName;
        if (updates.pricePerKg !== undefined) dbUpdates.price_per_kg = Number(updates.pricePerKg);
        if (updates.inStock !== undefined) dbUpdates.in_stock = Boolean(updates.inStock);
        if (updates.badge !== undefined) dbUpdates.badge = updates.badge;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
        if (updates.image !== undefined) dbUpdates.image = updates.image;

        await supabase.from('products').update(dbUpdates).eq('id', id);
      } catch (err) {}
    }

    return merged;
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {}
    }

    const removed = db.deleteProduct(id);
    return { success: true, removed };
  }

  /**
   * Seed / Reset all 17 default products
   */
  async seedProducts() {
    db.seedInitialData();
    return { success: true, count: db.getProducts().length, message: 'Products seeded successfully in Live Database' };
  }

  mapDatabaseToProduct(row) {
    return {
      id: row.id,
      name: row.name,
      teluguName: row.telugu_name,
      category: row.category,
      categoryLabel: row.category_label || row.category,
      pricePerKg: Number(row.price_per_kg),
      unit: row.unit || 'kg',
      tagline: row.tagline || '',
      description: row.description || '',
      badge: row.badge || '',
      image: row.image,
      taste: row.taste || '',
      rating: Number(row.rating) || 5.0,
      reviewCount: Number(row.review_count) || 0,
      inStock: row.in_stock !== false,
      ingredients: row.ingredients || '',
      variantPrices: row.variant_prices || {}
    };
  }

  mapProductToDatabase(prod) {
    return {
      id: prod.id,
      name: prod.name,
      telugu_name: prod.teluguName || '',
      category: prod.category,
      category_label: prod.categoryLabel || prod.category,
      price_per_kg: Number(prod.pricePerKg),
      unit: prod.unit || 'kg',
      tagline: prod.tagline || '',
      description: prod.description || '',
      badge: prod.badge || '',
      image: prod.image,
      taste: prod.taste || '',
      rating: Number(prod.rating) || 5.0,
      review_count: Number(prod.reviewCount) || 0,
      in_stock: prod.inStock !== false,
      ingredients: prod.ingredients || '',
      variant_prices: prod.variantPrices || {}
    };
  }
}

export const productsService = new ProductsService();
