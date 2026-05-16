/**
 * DummyJSON Product Seeder
 * Fetches ~100 electronics products from dummyjson.com and POSTs them
 * to your running backend via the admin API.
 *
 * Usage:
 *   1. Make sure your backend is running  (mvn spring-boot:run)
 *   2. Fill in your admin credentials below
 *   3. node scripts/seed-products.js
 *
 * No API key needed — DummyJSON is free and public.
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BACKEND_URL    = 'http://localhost:8080';
const ADMIN_EMAIL    = 'admin@estore.com';
const ADMIN_PASSWORD = 'admin123';
const IMAGES_DIR     = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'static', 'uploads', 'images');
// ──────────────────────────────────────────────────────────────────────────────

// Electronics only — no fashion accessories or watches
const CATEGORY_MAP = {
  'smartphones':        'Smartphones',
  'laptops':            'Laptops',
  'tablets':            'Laptops',
  'mobile-accessories': 'Accessories',
};

// Local Pexels images per category (more reliable than DummyJSON CDN)
const CATEGORY_PREFIXES = {
  'Smartphones' : ['phone'],
  'Laptops'     : ['laptop', 'tablet'],
  'Accessories' : ['accessory', 'audio'],
};

// Load local images grouped by prefix
function loadLocalImages() {
  if (!fs.existsSync(IMAGES_DIR)) return {};
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const byPrefix = {};
  for (const file of files) {
    const prefix = file.split('_')[0].split('.')[0];
    if (!byPrefix[prefix]) byPrefix[prefix] = [];
    byPrefix[prefix].push(file);
  }
  return byPrefix;
}

const LOCAL_IMAGES = loadLocalImages();
const categoryCounters = {};

function pickLocalImage(categoryName) {
  const prefixes = CATEGORY_PREFIXES[categoryName] || [];
  const pool = prefixes.flatMap(p => LOCAL_IMAGES[p] || []);
  if (!pool.length) return null;
  const idx = categoryCounters[categoryName] ?? 0;
  categoryCounters[categoryName] = idx + 1;
  return `/uploads/images/${pool[idx % pool.length]}`;
}

// Electronics categories to seed (from DummyJSON)
const TARGET_CATEGORIES = Object.keys(CATEGORY_MAP);

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const proto = options.protocol === 'https:' ? https : http;
    const req = proto.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function post(path, data, token = null) {
  const body = JSON.stringify(data);
  const url  = new URL(BACKEND_URL + path);
  return request({
    hostname : url.hostname,
    port     : url.port || (url.protocol === 'https:' ? 443 : 80),
    path     : url.pathname,
    method   : 'POST',
    protocol : url.protocol,
    headers  : {
      'Content-Type'  : 'application/json',
      'Content-Length': Buffer.byteLength(body),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }, body);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function login() {
  console.log(`  Logging in as ${ADMIN_EMAIL}...`);
  const res = await post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  if (res.status !== 200) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.body)}`);
  }

  const token = res.body?.data?.token;
  if (!token) throw new Error('No token in login response');
  console.log('  ✓ Logged in\n');
  return token;
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function createCategories(token) {
  console.log('  Creating categories...');

  // Unique category names we'll actually use
  const needed = [...new Set(Object.values(CATEGORY_MAP))];
  const categoryIds = {};

  for (const name of needed) {
    const res = await post(
      '/api/admin/categories',
      { id: null, name, description: `${name} products` },
      token
    );

    if (res.status === 201 || res.status === 200) {
      const id = res.body?.data?.id;
      categoryIds[name] = id;
      console.log(`    ✓ ${name}  (id: ${id})`);
    } else if (res.status === 409 || (typeof res.body === 'object' && res.body?.message?.toLowerCase().includes('exist'))) {
      // Category already exists — fetch existing ones to get the id
      console.log(`    ~ ${name} already exists, will re-use`);
    } else {
      console.log(`    ⚠  ${name}: ${res.status} — ${JSON.stringify(res.body).slice(0, 120)}`);
    }

    await sleep(100);
  }

  // Fetch all categories to fill in any IDs we missed
  try {
    const catRes = await new Promise((resolve, reject) => {
      const url = new URL(BACKEND_URL + '/api/categories');
      http.get({ hostname: url.hostname, port: url.port, path: url.pathname }, res => {
        let d = '';
        res.on('data', c => (d += c));
        res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
      }).on('error', reject);
    });

    const cats = catRes?.data || [];
    for (const cat of cats) {
      if (!categoryIds[cat.name]) categoryIds[cat.name] = cat.id;
    }
  } catch { /* ignore */ }

  console.log('');
  return categoryIds;
}

// ─── Fetch from DummyJSON ─────────────────────────────────────────────────────

async function fetchDummyProducts() {
  console.log('  Fetching products from DummyJSON...\n');
  const all = [];

  for (const slug of TARGET_CATEGORIES) {
    try {
      const url = `https://dummyjson.com/products/category/${slug}?limit=30`;
      const data = await getJson(url);
      const count = data.products?.length || 0;
      console.log(`    ${slug}: ${count} products`);
      if (data.products) all.push(...data.products.map(p => ({ ...p, _category: slug })));
      await sleep(200);
    } catch (err) {
      console.log(`    ⚠  Failed to fetch "${slug}": ${err.message}`);
    }
  }

  // Remove duplicates by id
  const seen = new Set();
  const unique = all.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
  console.log(`\n  Total unique products fetched: ${unique.length}\n`);
  return unique;
}

// ─── Seed products ────────────────────────────────────────────────────────────

function mapProduct(dummyProduct, categoryIds) {
  const ourCategoryName = CATEGORY_MAP[dummyProduct._category];
  const categoryId = categoryIds[ourCategoryName];

  if (!categoryId) return null;

  // Use DummyJSON thumbnail — actual product photos (white-bg Apple/Samsung shots)
  const imageUrl = dummyProduct.thumbnail || null;

  // Build a richer description: use DummyJSON description + key specs
  const specs = [
    dummyProduct.brand      ? `Brand: ${dummyProduct.brand}`           : null,
    dummyProduct.model      ? `Model: ${dummyProduct.model}`            : null,
    dummyProduct.color      ? `Color: ${dummyProduct.color}`            : null,
    dummyProduct.weight     ? `Weight: ${dummyProduct.weight}g`         : null,
    dummyProduct.warrantyInformation ? dummyProduct.warrantyInformation : null,
    dummyProduct.shippingInformation ? dummyProduct.shippingInformation : null,
  ].filter(Boolean);

  const baseDesc = dummyProduct.description || `${dummyProduct.title} — a premium electronics product.`;
  const description = specs.length
    ? `${baseDesc}\n\n${specs.join(' · ')}`
    : baseDesc;

  // Clamp stock to something realistic
  const stock = Math.min(dummyProduct.stock ?? 50, 200);

  // Round price to 2 decimals and ensure it's positive
  const price = Math.max(0.01, Math.round((dummyProduct.price || 9.99) * 100) / 100);

  return {
    id          : null,
    name        : dummyProduct.title,
    price,
    imageUrl,
    description,
    categoryName: ourCategoryName,
    categoryId,
    stock,
    videoPath   : null,
    imagePaths  : [],   // local images only; no CDN paths
    createdAt   : null,
  };
}

async function seedProducts(products, categoryIds, token) {
  console.log(`  Posting ${products.length} products to backend...\n`);

  let success = 0;
  let failed  = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const mapped = mapProduct(products[i], categoryIds);

    if (!mapped) {
      skipped++;
      continue;
    }

    try {
      const res = await post('/api/admin/products', mapped, token);

      if (res.status === 201 || res.status === 200) {
        success++;
        const id = res.body?.data?.id;
        process.stdout.write(`\r    Progress: ${success + failed} / ${products.length - skipped}   ✓ ${mapped.name.slice(0, 40)}`);
      } else {
        failed++;
        console.log(`\n    ✗ ${mapped.name}: ${res.status} — ${JSON.stringify(res.body).slice(0, 100)}`);
      }
    } catch (err) {
      failed++;
      console.log(`\n    ✗ ${mapped.name}: ${err.message}`);
    }

    await sleep(80); // small delay to avoid hammering the backend
  }

  console.log('');
  return { success, failed, skipped };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(55));
  console.log('  Estoré — DummyJSON Product Seeder');
  console.log('═'.repeat(55) + '\n');

  // 1. Login
  let token;
  try {
    token = await login();
  } catch (err) {
    console.error(`\n  ERROR: ${err.message}`);
    console.error('  Is the backend running? ( cd backend && mvn spring-boot:run )');
    console.error('  Are the admin credentials correct?\n');
    process.exit(1);
  }

  // 2. Create categories
  const categoryIds = await createCategories(token);

  const missingIds = Object.values(categoryIds).filter(id => !id);
  if (missingIds.length > 0) {
    console.warn('  ⚠  Some category IDs could not be resolved. Products in those categories will be skipped.\n');
  }

  // 3. Fetch from DummyJSON
  const dummyProducts = await fetchDummyProducts();

  // 4. Seed into backend
  const { success, failed, skipped } = await seedProducts(dummyProducts, categoryIds, token);

  // 5. Summary
  console.log('\n' + '─'.repeat(55));
  console.log('  Seeding complete!');
  console.log(`  ✓ Created  : ${success} products`);
  if (failed  > 0) console.log(`  ✗ Failed   : ${failed}`);
  if (skipped > 0) console.log(`  ~ Skipped  : ${skipped} (no matching category)`);
  console.log('─'.repeat(55));
  console.log('\n  Open http://localhost:4200/products to see the results.\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
