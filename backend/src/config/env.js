import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root or workspace root fallback
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  // CORS configuration (Storefront: 5173, Admin Portal: 5174)
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim()),

  // Admin Portal Auth & Cryptography (Strictly from .env)
  HEX_SECRET_KEY: process.env.HEX_SECRET_KEY || process.env.JWT_SECRET || '',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  JWT_SECRET: process.env.HEX_SECRET_KEY || process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Supabase PostgreSQL (Strictly from .env)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',

  // Shiprocket Courier (Strictly from .env)
  SHIPROCKET_EMAIL: process.env.SHIPROCKET_EMAIL || '',
  SHIPROCKET_PASSWORD: process.env.SHIPROCKET_PASSWORD || '',
  SHIPROCKET_PICKUP_PINCODE: process.env.SHIPROCKET_PICKUP_PINCODE || '518001',
  SHIPROCKET_PICKUP_LOCATION: process.env.SHIPROCKET_PICKUP_LOCATION || 'Bramarambika_Kitchen',
  SHIPROCKET_BASE_URL: 'https://apiv2.shiprocket.in/v1/external',

  // Cloudinary Image Storage & CDN
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || ''
};

// Strict Environment Validation
if (!env.HEX_SECRET_KEY) {
  console.error('[SECURITY ALERT] HEX_SECRET_KEY / JWT_SECRET is not configured in .env');
}
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  console.warn('[SECURITY WARNING] ADMIN_EMAIL or ADMIN_PASSWORD is not set in .env');
}
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('[CONFIG NOTICE] SUPABASE_URL or SUPABASE_ANON_KEY not set in .env');
}
