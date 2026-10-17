import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { INITIAL_PRODUCTS } from '../constants/initialProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class LiveDatabase {
  constructor() {
    this.data = {
      admins: [],
      products: [],
      orders: [],
      meta: {
        version: '1.0.0',
        seededAt: null
      }
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        // Auto-seed if database file does not exist yet
        this.seedInitialData();
      }
    } catch (err) {
      console.error('[LiveDatabase] Initialization error:', err.message);
      this.seedInitialData();
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[LiveDatabase] Failed to save database to disk:', err.message);
    }
  }

  /**
   * Seed default Admin credentials and 17 catalog products
   */
  seedInitialData() {
    console.log('[LiveDatabase] Seeding database with live products and admin credentials...');

    // 1. Seed Admin User with secure Bcrypt Hash
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(env.ADMIN_PASSWORD, salt);

    this.data.admins = [
      {
        id: 'admin_primary_001',
        email: env.ADMIN_EMAIL,
        name: 'Bramarambika Kitchen Owner',
        password_hash: passwordHash,
        role: 'superadmin',
        isAdmin: true,
        created_at: new Date().toISOString()
      }
    ];

    // 2. Seed 17 Authentic Products
    this.data.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));

    // 3. Metadata
    this.data.meta = {
      version: '1.0.0',
      seededAt: new Date().toISOString()
    };

    this.save();
    console.log(`[LiveDatabase] Successfully seeded 1 Admin and ${this.data.products.length} Products!`);
  }

  // --- ADMIN METHODS ---
  findAdminByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    return this.data.admins.find(a => a.email.toLowerCase() === cleanEmail) || null;
  }

  verifyAdminPassword(admin, password) {
    if (!admin || !admin.password_hash) return false;
    return bcrypt.compareSync(password, admin.password_hash);
  }

  reload() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {}
  }

  // --- PRODUCTS METHODS ---
  getProducts(filters = {}) {
    this.reload();
    let list = [...(this.data.products || [])];
    if (filters.category && filters.category !== 'all') {
      list = list.filter(p => p.category === filters.category);
    }
    if (filters.inStock !== undefined && filters.inStock !== null && filters.inStock !== '') {
      const boolVal = filters.inStock === 'true' || filters.inStock === true;
      list = list.filter(p => p.inStock === boolVal);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.teluguName && p.teluguName.toLowerCase().includes(q)) ||
        (p.tagline && p.tagline.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id) || null;
  }

  saveProduct(product) {
    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...product };
    } else {
      this.data.products.unshift(product);
    }
    this.save();
    return product;
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = this.data.products.splice(idx, 1);
      this.save();
      return removed[0];
    }
    return null;
  }

  // --- ORDERS METHODS ---
  getOrders(filters = {}) {
    this.reload();
    let list = [...(this.data.orders || [])];
    if (filters.status && filters.status !== 'All') {
      list = list.filter(o => o.status === filters.status);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(o =>
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q)) ||
        (o.id && String(o.id).toLowerCase().includes(q))
      );
    }
    return list;
  }

  saveOrder(order) {
    const idx = this.data.orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...order, updated_at: new Date().toISOString() };
    } else {
      this.data.orders.unshift(order);
    }
    this.save();
    return order;
  }

  deleteOrder(id) {
    const idx = this.data.orders.findIndex(o => String(o.id) === String(id));
    if (idx !== -1) {
      const removed = this.data.orders.splice(idx, 1);
      this.save();
      return removed[0];
    }
    return null;
  }

  clearOrders() {
    this.data.orders = [];
    this.save();
    return true;
  }
}

export const db = new LiveDatabase();
