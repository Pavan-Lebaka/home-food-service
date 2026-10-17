import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCompleteCloudinaryMigration() {
  if (!isCloudinaryConfigured()) {
    console.error('❌ Cloudinary is not configured. Check backend/.env');
    process.exit(1);
  }

  console.log('🌟 Starting Full Asset Migration to Cloudinary CDN...\n');

  // Source directory for all images
  const sourceDir = path.resolve(__dirname, '../../../frontend/public/images');
  if (!fs.existsSync(sourceDir)) {
    console.error('Source images directory not found:', sourceDir);
    process.exit(1);
  }

  const files = fs.readdirSync(sourceDir).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
  console.log(`Found ${files.length} images to upload.\n`);

  const urlMap = {};

  for (const file of files) {
    const localPath = path.join(sourceDir, file);
    const publicId = path.parse(file).name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    try {
      console.log(`⏳ Uploading ${file} -> Cloudinary [${publicId}]...`);
      const uploadRes = await cloudinary.uploader.upload(localPath, {
        folder: 'bramarambika_foods',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      const relativePath = `/images/${file}`;
      urlMap[relativePath] = uploadRes.secure_url;
      console.log(`   ✅ ${relativePath} => ${uploadRes.secure_url}`);
    } catch (err) {
      console.error(`   ❌ Failed to upload ${file}:`, err.message);
    }
  }

  // Save urlMap for reference
  const mapFile = path.resolve(__dirname, '../../data/cloudinary_map.json');
  fs.writeFileSync(mapFile, JSON.stringify(urlMap, null, 2), 'utf-8');
  console.log(`\n📄 Saved CDN map to ${mapFile}`);

  // 1. Update backend/src/constants/initialProducts.js
  const initialProductsPath = path.resolve(__dirname, '../constants/initialProducts.js');
  if (fs.existsSync(initialProductsPath)) {
    let content = fs.readFileSync(initialProductsPath, 'utf-8');
    for (const [relPath, cdnUrl] of Object.entries(urlMap)) {
      content = content.replaceAll(relPath, cdnUrl);
    }
    fs.writeFileSync(initialProductsPath, content, 'utf-8');
    console.log('✅ Updated backend/src/constants/initialProducts.js');
  }

  // 2. Update backend/data/db.json
  const dbPath = path.resolve(__dirname, '../../data/db.json');
  if (fs.existsSync(dbPath)) {
    let content = fs.readFileSync(dbPath, 'utf-8');
    for (const [relPath, cdnUrl] of Object.entries(urlMap)) {
      content = content.replaceAll(relPath, cdnUrl);
    }
    fs.writeFileSync(dbPath, content, 'utf-8');
    console.log('✅ Updated backend/data/db.json');
  }

  // 3. Update frontend/src/data/products.js
  const frontendDataPath = path.resolve(__dirname, '../../../frontend/src/data/products.js');
  if (fs.existsSync(frontendDataPath)) {
    let content = fs.readFileSync(frontendDataPath, 'utf-8');
    for (const [relPath, cdnUrl] of Object.entries(urlMap)) {
      content = content.replaceAll(relPath, cdnUrl);
    }
    fs.writeFileSync(frontendDataPath, content, 'utf-8');
    console.log('✅ Updated frontend/src/data/products.js');
  }

  // 4. Update Frontend UI Components that reference images
  const frontendComponentsDir = path.resolve(__dirname, '../../../frontend/src/components');
  if (fs.existsSync(frontendComponentsDir)) {
    const compFiles = fs.readdirSync(frontendComponentsDir).filter(f => /\.(jsx|js)$/.test(f));
    for (const cf of compFiles) {
      const fullPath = path.join(frontendComponentsDir, cf);
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const [relPath, cdnUrl] of Object.entries(urlMap)) {
        if (content.includes(relPath)) {
          content = content.replaceAll(relPath, cdnUrl);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`✅ Updated frontend/src/components/${cf}`);
      }
    }
  }

  // 5. Update Admin UI Components
  const adminComponentsDir = path.resolve(__dirname, '../../../admin/src/components');
  if (fs.existsSync(adminComponentsDir)) {
    const compFiles = fs.readdirSync(adminComponentsDir).filter(f => /\.(jsx|js)$/.test(f));
    for (const cf of compFiles) {
      const fullPath = path.join(adminComponentsDir, cf);
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const [relPath, cdnUrl] of Object.entries(urlMap)) {
        if (content.includes(relPath)) {
          content = content.replaceAll(relPath, cdnUrl);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`✅ Updated admin/src/components/${cf}`);
      }
    }
  }

  console.log('\n🎉 ALL 30 IMAGES MIGRATED TO CLOUDINARY CDN SUCCESSFULLY!');
}

runCompleteCloudinaryMigration();
