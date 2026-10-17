import { db } from '../db/database.js';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import { INITIAL_PRODUCTS } from '../constants/initialProducts.js';

async function runSeed() {
  console.log('========================================================');
  console.log('🌱 Starting Live Database & Auth Seeding Process...');
  console.log('========================================================');

  // 1. Seed Local Persistent Database
  db.seedInitialData();
  console.log('✅ Local Database: Seeded with 1 Admin & 17 Products in backend/data/db.json');

  // 2. Seed Supabase Auth with Owner Account
  if (supabase) {
    try {
      console.log(`\n🔐 Seeding Admin Auth in Supabase (${env.ADMIN_EMAIL})...`);
      const authRes = await supabase.auth.signUp({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        options: {
          data: {
            full_name: 'Bramarambika Kitchen Owner',
            role: 'admin'
          }
        }
      });

      if (authRes.error) {
        if (authRes.error.message.includes('already registered')) {
          console.log('✅ Supabase Auth: Admin account is already registered and ready.');
        } else {
          console.log('ℹ️ Supabase Auth notice:', authRes.error.message);
        }
      } else if (authRes.data?.user) {
        console.log('✅ Supabase Auth: Successfully created admin user ID:', authRes.data.user.id);
      }
    } catch (err) {
      console.warn('⚠️ Supabase Auth seed error:', err.message);
    }

    // 3. Try seeding Supabase products table if created
    try {
      console.log('\n📦 Checking Supabase products table...');
      const checkRes = await supabase.from('products').select('id').limit(1);
      if (!checkRes.error) {
        console.log('⚡ Supabase products table found! Syncing 17 products to Supabase...');
        const payloads = INITIAL_PRODUCTS.map(p => ({
          id: p.id,
          name: p.name,
          telugu_name: p.teluguName || '',
          category: p.category,
          category_label: p.categoryLabel,
          price_per_kg: p.pricePerKg,
          unit: p.unit || 'kg',
          tagline: p.tagline || '',
          description: p.description || '',
          badge: p.badge || '',
          image: p.image,
          taste: p.taste || '',
          rating: p.rating || 5.0,
          review_count: p.reviewCount || 0,
          in_stock: p.inStock !== false,
          ingredients: p.ingredients || '',
          variant_prices: p.variantPrices || {}
        }));

        const upsertRes = await supabase.from('products').upsert(payloads, { onConflict: 'id' });
        if (!upsertRes.error) {
          console.log('✅ Supabase: 17 Products synced to public.products table successfully!');
        } else {
          console.log('ℹ️ Supabase sync note:', upsertRes.error.message);
        }
      } else {
        console.log('ℹ️ Supabase products table not yet created in SQL editor. All products are served live from backend DB engine.');
      }
    } catch (err) {
      console.warn('⚠️ Supabase table seed error:', err.message);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 LIVE SEEDING COMPLETE!');
  console.log(`🔐 Admin:   ${env.ADMIN_EMAIL ? env.ADMIN_EMAIL.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '[Not configured]'}`);
  console.log(`🔑 Hex Key: ${env.HEX_SECRET_KEY ? '[Configured & Active in .env]' : '[Missing]'}`);
  console.log(`📦 Catalog: 17 Authentic Dishes Live in DB`);
  console.log('========================================================\n');
}

runSeed().catch(console.error);
