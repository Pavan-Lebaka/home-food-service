import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { INITIAL_PRODUCTS } from '../constants/initialProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateCatalogImages() {
  if (!isCloudinaryConfigured()) {
    console.error('❌ Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env');
    process.exit(1);
  }

  console.log('🚀 Starting Cloudinary Catalog Migration for 17 authentic products...\n');

  const imagesDir = path.resolve(__dirname, '../../public/images');
  const dbFile = path.resolve(__dirname, '../../data/db.json');
  const initialProductsFile = path.resolve(__dirname, '../constants/initialProducts.js');

  const urlMap = {};

  for (const product of INITIAL_PRODUCTS) {
    if (!product.image || !product.image.startsWith('/images/')) {
      console.log(`⏩ Skipping ${product.name} (already public URL: ${product.image})`);
      continue;
    }

    const filename = path.basename(product.image);
    const localPath = path.resolve(imagesDir, filename);

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️ Image not found locally: ${localPath}`);
      continue;
    }

    try {
      console.log(`⏳ Uploading ${filename} (${product.name})...`);
      const res = await cloudinary.uploader.upload(localPath, {
        folder: 'bramarambika_foods',
        public_id: product.id,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      console.log(`✅ Uploaded ${product.id} -> ${res.secure_url}`);
      urlMap[product.image] = res.secure_url;
      product.image = res.secure_url;
    } catch (err) {
      console.error(`❌ Failed to upload ${filename}:`, err.message);
    }
  }

  // Update backend/data/db.json if it exists
  if (fs.existsSync(dbFile)) {
    try {
      const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      if (Array.isArray(db.products)) {
        db.products = db.products.map(p => {
          if (urlMap[p.image]) {
            return { ...p, image: urlMap[p.image] };
          }
          return p;
        });
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
        console.log('\n✅ Updated backend/data/db.json with Cloudinary public URLs!');
      }
    } catch (err) {
      console.error('Failed to update db.json:', err.message);
    }
  }

  console.log('\n🎉 Migration complete! All images are now hosted on Cloudinary CDN.');
}

migrateCatalogImages();
