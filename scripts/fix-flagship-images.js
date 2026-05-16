/**
 * Assigns best-match DummyJSON product images to flagship products
 * that didn't have an exact name match (iPhone 15, MacBook Pro 16, etc.)
 *
 * Uses fuzzy category-based matching to assign real product shots.
 *
 * Usage:  node scripts/fix-flagship-images.js
 */

const https = require('https');
const http  = require('http');

const ADMIN_EMAIL    = 'admin@estore.com';
const ADMIN_PASSWORD = 'admin123';

// Map of flagship names → best DummyJSON image to use
// (pulled from dummyjson.com product photos)
const FLAGSHIP_IMAGES = {
  // Smartphones — use high-end DummyJSON phone images
  'iPhone 15':              'https://cdn.dummyjson.com/products/images/smartphones/iPhone%2015/thumbnail.png',
  'Samsung Galaxy S24':     'https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/thumbnail.png',
  'Google Pixel 8':         'https://cdn.dummyjson.com/products/images/smartphones/Vivo%20X21/thumbnail.png',

  // Laptops
  'MacBook Pro 16':         'https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png',
  'Dell XPS 15':            'https://cdn.dummyjson.com/products/images/laptops/New%20DELL%20XPS%2013%209300%20Laptop/thumbnail.png',
  'Lenovo ThinkPad X1':     'https://cdn.dummyjson.com/products/images/laptops/Lenovo%20Yoga%20920/thumbnail.png',
};

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const proto = options.protocol === 'https:' ? https : http;
    const req = proto.request(options, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
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

function getAdmin(path, token) {
  return request({
    hostname: 'localhost', port: 8080, path,
    method: 'GET', protocol: 'http:',
    headers: { Authorization: `Bearer ${token}` }
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login() {
  const body = JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const res = await request({
    hostname: 'localhost', port: 8080,
    path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  if (res.status !== 200) throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  return res.body?.data?.token;
}

async function fetchAllDbProducts(token) {
  const all = [];
  let page = 0;
  while (true) {
    const res = await getAdmin(`/api/admin/products/page?page=${page}&size=100&sortBy=id&sortDir=asc`, token);
    const content = res.body?.data?.content || [];
    all.push(...content);
    if (res.body?.data?.last || content.length < 100) break;
    page++;
  }
  return all;
}

async function main() {
  console.log('═'.repeat(55));
  console.log('  Estoré — Fix Flagship Images');
  console.log('═'.repeat(55) + '\n');

  const token = await login();
  console.log('  ✓ Logged in\n');

  const products = await fetchAllDbProducts(token);

  // Also fix any product whose imageUrl starts with /uploads/ (Pexels) by category
  // Using DummyJSON category representative images as fallbacks
  const CATEGORY_FALLBACK_IMAGES = {
    'Smartphones': 'https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/thumbnail.png',
    'Laptops':     'https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png',
    'Accessories': 'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png',
  };

  let updated = 0;

  for (const p of products) {
    // Only fix products that still have local /uploads/ Pexels images
    const needsFix = p.imageUrl && p.imageUrl.startsWith('/uploads/');
    if (!needsFix) continue;

    // Try exact name match first, then category fallback
    const imageUrl = FLAGSHIP_IMAGES[p.name] || CATEGORY_FALLBACK_IMAGES[p.categoryName];
    if (!imageUrl) continue;

    const payload = {
      id: p.id, name: p.name, price: p.price,
      imageUrl,
      description: p.description,
      categoryName: p.categoryName, categoryId: p.categoryId,
      stock: p.stock,
      videoPath: p.videoPath || null,
      imagePaths: p.imagePaths || [],
      createdAt: p.createdAt || null,
      featured: p.featured || false,
    };

    const res = await put(`/api/admin/products/${p.id}`, payload, token);
    if (res.status === 200) {
      updated++;
      console.log(`  ✓ ${p.name}`);
    }
    await sleep(60);
  }

  console.log(`\n  Updated ${updated} products.`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
