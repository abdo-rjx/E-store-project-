/**
 * Restore DummyJSON Product Images
 *
 * Re-fetches real product photos from DummyJSON CDN and updates the DB.
 * DummyJSON has proper product shots (white-bg iPhone, MacBook, etc.)
 * that look much better than generic Pexels lifestyle photos.
 *
 * Usage:  node scripts/restore-dummyjson-images.js
 *         (backend must be running)
 */

const https = require('https');
const http  = require('http');

const BACKEND_URL    = 'http://localhost:8080';
const ADMIN_EMAIL    = 'admin@estore.com';
const ADMIN_PASSWORD = 'admin123';

const DUMMYJSON_CATEGORIES = [
  'smartphones',
  'laptops',
  'tablets',
  'mobile-accessories',
];

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

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
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

// ─── Fetch all products from our DB ──────────────────────────────────────────

async function fetchAllDbProducts(token) {
  const all = [];
  let page = 0;
  while (true) {
    const res = await getAdmin(
      `/api/admin/products/page?page=${page}&size=100&sortBy=id&sortDir=asc`, token
    );
    const content = res.body?.data?.content || [];
    all.push(...content);
    if (res.body?.data?.last || content.length < 100) break;
    page++;
  }
  return all;
}

// ─── Build name → image map from DummyJSON ────────────────────────────────────

async function buildDummyJsonImageMap() {
  console.log('  Fetching product photos from DummyJSON…');
  const imageMap = {}; // name → { thumbnail, images }

  for (const slug of DUMMYJSON_CATEGORIES) {
    try {
      const url = `https://dummyjson.com/products/category/${slug}?limit=30`;
      const data = await getJson(url);
      for (const p of (data.products || [])) {
        imageMap[p.title] = {
          thumbnail : p.thumbnail,
          images    : (p.images || []).slice(0, 5),
        };
      }
      console.log(`    ✓ ${slug}: ${data.products?.length || 0} products`);
      await sleep(200);
    } catch (err) {
      console.log(`    ⚠  Failed to fetch ${slug}: ${err.message}`);
    }
  }

  console.log(`\n  Total image entries: ${Object.keys(imageMap).length}\n`);
  return imageMap;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(55));
  console.log('  Estoré — Restore DummyJSON Product Images');
  console.log('═'.repeat(55) + '\n');

  const token    = await login();
  console.log('  ✓ Logged in\n');

  const imageMap = await buildDummyJsonImageMap();
  const products = await fetchAllDbProducts(token);
  console.log(`  DB products to process: ${products.length}\n`);

  let updated = 0;
  let notFound = 0;

  for (const p of products) {
    const match = imageMap[p.name];
    if (!match) {
      notFound++;
      continue;
    }

    const payload = {
      id          : p.id,
      name        : p.name,
      price       : p.price,
      imageUrl    : match.thumbnail,
      description : p.description,
      categoryName: p.categoryName,
      categoryId  : p.categoryId,
      stock       : p.stock,
      videoPath   : p.videoPath || null,
      imagePaths  : match.images,
      createdAt   : p.createdAt || null,
      featured    : p.featured || false,
    };

    const res = await put(`/api/admin/products/${p.id}`, payload, token);
    if (res.status === 200) {
      updated++;
      process.stdout.write(`\r    Updated ${updated}  ${p.name.slice(0, 45).padEnd(45)}`);
    } else {
      console.log(`\n    ⚠  id=${p.id}: ${res.status}`);
    }
    await sleep(60);
  }

  console.log('\n\n' + '─'.repeat(55));
  console.log('  Done!');
  console.log(`  ✓ Updated  : ${updated} products with DummyJSON images`);
  if (notFound > 0) console.log(`  ~ No match : ${notFound} products (names not in DummyJSON)`);
  console.log('─'.repeat(55));
  console.log('\n  Refresh http://localhost:4200 to see the results.\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
