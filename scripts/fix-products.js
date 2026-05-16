/**
 * Fix Products Script
 *
 * 1. Deletes all Wearables (watch) products — not electronics
 * 2. Re-assigns local Pexels images to all remaining products
 *    (replaces DummyJSON CDN URLs which are unreliable)
 *
 * Usage:
 *   1. Make sure your backend is running  (mvn spring-boot:run)
 *   2. node scripts/fix-products.js
 */

const fs   = require('fs');
const path = require('path');
const http = require('http');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BACKEND_URL    = 'http://localhost:8080';
const ADMIN_EMAIL    = 'admin@estore.com';
const ADMIN_PASSWORD = 'admin123';
const IMAGES_DIR     = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'static', 'uploads', 'images');
// ──────────────────────────────────────────────────────────────────────────────

// Which image prefixes belong to each category
const CATEGORY_PREFIXES = {
  'Smartphones' : ['phone'],
  'Laptops'     : ['laptop', 'tablet'],
  'Accessories' : ['accessory', 'audio'],
};

// ─── Load local images ────────────────────────────────────────────────────────

function loadLocalImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`  ✗ Images directory not found: ${IMAGES_DIR}`);
    console.error('    Run  node scripts/download-assets.js  first.');
    process.exit(1);
  }
  const files = fs.readdirSync(IMAGES_DIR).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );
  const byPrefix = {};
  for (const file of files) {
    const prefix = file.split('_')[0].split('.')[0]; // e.g. "phone" from "phone_123.jpg"
    if (!byPrefix[prefix]) byPrefix[prefix] = [];
    byPrefix[prefix].push(file);
  }
  return byPrefix;
}

function pickImage(categoryName, localImages, index) {
  const prefixes = CATEGORY_PREFIXES[categoryName] || [];
  const pool = prefixes.flatMap(p => localImages[p] || []);
  if (!pool.length) return null;
  return `/uploads/images/${pool[index % pool.length]}`;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function post(path, data, token) {
  const body = JSON.stringify(data);
  return request({
    hostname: 'localhost', port: 8080, path,
    method: 'POST', protocol: 'http:',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: `Bearer ${token}`,
    }
  }, body);
}

function put(path, data, token) {
  const body = JSON.stringify(data);
  return request({
    hostname: 'localhost', port: 8080, path,
    method: 'PUT', protocol: 'http:',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: `Bearer ${token}`,
    }
  }, body);
}

function del(path, token) {
  return request({
    hostname: 'localhost', port: 8080, path,
    method: 'DELETE', protocol: 'http:',
    headers: { Authorization: `Bearer ${token}` }
  });
}

function getAdmin(path, token) {
  return request({
    hostname: 'localhost', port: 8080, path,
    method: 'GET', protocol: 'http:',
    headers: { Authorization: `Bearer ${token}` }
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function login() {
  const body = JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const res = await request({
    hostname: 'localhost', port: 8080,
    path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  if (res.status !== 200) throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  const token = res.body?.data?.token;
  if (!token) throw new Error('No token in login response');
  return token;
}

// ─── Fetch ALL products ───────────────────────────────────────────────────────

async function fetchAllProducts(token) {
  const all = [];
  let page = 0;
  const size = 100;

  while (true) {
    const res = await getAdmin(
      `/api/admin/products/page?page=${page}&size=${size}&sortBy=id&sortDir=asc`,
      token
    );
    if (res.status !== 200) throw new Error(`Fetch products failed: ${res.status}`);
    const content = res.body?.data?.content || [];
    all.push(...content);
    const last = res.body?.data?.last;
    if (last || content.length < size) break;
    page++;
  }
  return all;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(55));
  console.log('  Estoré — Fix Products (images + remove watches)');
  console.log('═'.repeat(55) + '\n');

  const localImages = loadLocalImages();
  const prefixCounts = Object.entries(localImages).map(([k, v]) => `${k}: ${v.length}`).join(', ');
  console.log(`  Local images loaded: ${prefixCounts}\n`);

  console.log('  Logging in…');
  const token = await login();
  console.log('  ✓ Logged in\n');

  console.log('  Fetching all products…');
  const products = await fetchAllProducts(token);
  console.log(`  ✓ ${products.length} products found\n`);

  // Count wearables
  const wearables = products.filter(p => p.categoryName === 'Wearables');
  const electronics = products.filter(p => p.categoryName !== 'Wearables');
  console.log(`  Wearables to delete : ${wearables.length}`);
  console.log(`  Electronics to fix  : ${electronics.length}\n`);

  // ── Step 1: Delete Wearables ──────────────────────────────────────────────
  console.log('  Deleting Wearables (watches)…');
  let deleted = 0;
  for (const p of wearables) {
    const res = await del(`/api/admin/products/${p.id}`, token);
    if (res.status === 200) {
      deleted++;
      process.stdout.write(`\r    Deleted ${deleted}/${wearables.length}   `);
    } else {
      console.log(`\n    ⚠  Failed to delete id=${p.id}: ${res.status}`);
    }
    await sleep(60);
  }
  console.log(`\n  ✓ Deleted ${deleted} watch products\n`);

  // ── Step 2: Fix images for all electronics ────────────────────────────────
  console.log('  Reassigning local images…');
  let imgUpdated = 0;
  let imgSkipped = 0;

  // Track per-category index so each product gets a different image
  const categoryCounter = {};

  for (const p of electronics) {
    const idx = categoryCounter[p.categoryName] ?? 0;
    categoryCounter[p.categoryName] = idx + 1;

    const localImg = pickImage(p.categoryName, localImages, idx);
    if (!localImg) {
      imgSkipped++;
      continue;
    }

    // Only update if no image or using an external CDN URL
    const hasLocalImage = p.imageUrl && p.imageUrl.startsWith('/uploads/');
    if (hasLocalImage) {
      imgSkipped++;
      continue;
    }

    const payload = {
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: localImg,
      description: p.description,
      categoryName: p.categoryName,
      categoryId: p.categoryId,
      stock: p.stock,
      videoPath: p.videoPath || null,
      imagePaths: p.imagePaths || [],
      createdAt: p.createdAt || null,
      featured: p.featured || false,
    };

    const res = await put(`/api/admin/products/${p.id}`, payload, token);
    if (res.status === 200) {
      imgUpdated++;
      process.stdout.write(`\r    Updated ${imgUpdated}  [${p.categoryName}] ${p.name.slice(0, 35)}`);
    } else {
      console.log(`\n    ⚠  id=${p.id}: ${res.status} — ${JSON.stringify(res.body).slice(0, 80)}`);
    }
    await sleep(60);
  }

  console.log('');
  console.log('\n' + '─'.repeat(55));
  console.log('  Done!');
  console.log(`  ✓ Deleted  : ${deleted} wearable products`);
  console.log(`  ✓ Images   : ${imgUpdated} products updated to local images`);
  if (imgSkipped > 0) console.log(`  ~ Skipped  : ${imgSkipped} (already local or no matching images)`);
  console.log('─'.repeat(55));
  console.log('\n  Refresh http://localhost:4200 to see the results.\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  console.error('Is the backend running? ( cd backend && mvn spring-boot:run )');
  process.exit(1);
});
