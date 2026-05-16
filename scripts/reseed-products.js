/**
 * Estoré — Full Catalog Reseed
 *
 * Phase 1: Delete ALL existing products
 * Phase 2: Upsert 4 categories (Smartphones, Laptops, Tablets, Audio)
 * Phase 3: Seed ~20 products per category using DummyJSON API + hardcoded flagships
 *
 * Usage:
 *   1. cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
 *   2. node scripts/reseed-products.js
 */

const https = require('https');
const http  = require('http');

const BACKEND   = 'http://localhost:8080';
const ADMIN_EMAIL    = 'admin@estore.com';
const ADMIN_PASSWORD = 'admin123';

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

function apiRequest(method, path, data, token) {
  const body = data ? JSON.stringify(data) : null;
  const url  = new URL(BACKEND + path);
  return request({
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + (url.search || ''),
    method,
    protocol: url.protocol,
    headers: {
      ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }, body);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Phase 0: Auth ────────────────────────────────────────────────────────────

async function login() {
  const res = await apiRequest('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  if (res.status !== 200) throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  const token = res.body?.data?.token;
  if (!token) throw new Error('No token in login response');
  return token;
}

// ─── Phase 1: Delete all products ─────────────────────────────────────────────

async function deleteAllProducts(token) {
  console.log('  Fetching all products to delete...');
  const all = [];
  let page = 0;
  while (true) {
    const res = await apiRequest('GET', `/api/admin/products/page?page=${page}&size=100&sortBy=id&sortDir=asc`, null, token);
    const content = res.body?.data?.content || [];
    all.push(...content);
    if (res.body?.data?.last || content.length < 100) break;
    page++;
  }
  console.log(`  Found ${all.length} products — deleting...`);

  let deleted = 0;
  for (const p of all) {
    const res = await apiRequest('DELETE', `/api/admin/products/${p.id}`, null, token);
    if (res.status === 200 || res.status === 204 || res.status === 204) deleted++;
    else console.log(`    ⚠  Failed to delete ${p.id} (${p.name}): ${res.status}`);
    await sleep(40);
  }
  console.log(`  ✓ Deleted ${deleted}/${all.length} products\n`);
}

// ─── Phase 2: Upsert categories ───────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Smartphones', description: 'Latest flagship and mid-range smartphones' },
  { name: 'Laptops',     description: 'Ultrabooks, workstations, and gaming laptops' },
  { name: 'Tablets',     description: 'iPads, Android tablets, and 2-in-1s' },
  { name: 'Audio',       description: 'Headphones, earbuds, and wireless speakers' },
];

async function upsertCategories(token) {
  console.log('  Creating categories...');
  const categoryIds = {};

  for (const cat of CATEGORIES) {
    const res = await apiRequest('POST', '/api/admin/categories', { id: null, name: cat.name, description: cat.description }, token);
    if (res.status === 201 || res.status === 200) {
      categoryIds[cat.name] = res.body?.data?.id;
      console.log(`    ✓ ${cat.name}  (id: ${categoryIds[cat.name]})`);
    } else {
      console.log(`    ~ ${cat.name} already exists`);
    }
    await sleep(100);
  }

  // Fetch list to fill any missing IDs
  try {
    const res = await apiRequest('GET', '/api/categories', null, null);
    const cats = res.body?.data || [];
    for (const c of cats) {
      if (!categoryIds[c.name]) categoryIds[c.name] = c.id;
    }
  } catch { /* ignore */ }

  const missing = CATEGORIES.filter(c => !categoryIds[c.name]);
  if (missing.length) console.log(`  ⚠  Could not resolve IDs for: ${missing.map(c => c.name).join(', ')}`);
  console.log('');
  return categoryIds;
}

// ─── Phase 3: Product catalog ─────────────────────────────────────────────────

const CDN = 'https://cdn.dummyjson.com/products/images';

// Supplemental flagships that aren't in DummyJSON — using closest CDN image
const SUPPLEMENTAL = {
  Smartphones: [
    { name: 'Samsung Galaxy S24 Ultra',  price: 1299.99, stock: 35, image: `${CDN}/smartphones/Samsung%20Galaxy%20S10/thumbnail.png`,      desc: 'Flagship Galaxy with 200MP camera, S Pen, and titanium frame. The ultimate Android powerhouse.\n\nBrand: Samsung · Color: Titanium Black · RAM: 12GB · Storage: 256GB' },
    { name: 'Samsung Galaxy S24+',       price:  999.99, stock: 50, image: `${CDN}/smartphones/Samsung%20Galaxy%20S10/thumbnail.png`,      desc: 'Large-screen Galaxy with ProVisual Engine and 50MP main camera. Vivid 6.7" Dynamic AMOLED display.\n\nBrand: Samsung · Color: Cobalt Violet · Storage: 256GB' },
    { name: 'Google Pixel 9 Pro',        price: 1099.99, stock: 30, image: `${CDN}/smartphones/Vivo%20X21/thumbnail.png`,                  desc: 'Google\'s AI-first flagship. Best-in-class computational photography with Tensor G4 chip.\n\nBrand: Google · Color: Porcelain · Storage: 128GB · OS: Android 15' },
    { name: 'Google Pixel 9',            price:  799.99, stock: 45, image: `${CDN}/smartphones/Vivo%20X21/thumbnail.png`,                  desc: 'Pure Android experience with advanced AI features and excellent camera. Compact 6.3" OLED display.\n\nBrand: Google · Color: Obsidian · Storage: 128GB' },
    { name: 'OnePlus 12',                price:  799.99, stock: 40, image: `${CDN}/smartphones/iPhone%2015/thumbnail.webp`,                desc: 'Flagship killer with Snapdragon 8 Gen 3, Hasselblad camera system, and 100W fast charging.\n\nBrand: OnePlus · Color: Silky Black · RAM: 12GB · Storage: 256GB' },
    { name: 'Xiaomi 14 Ultra',           price:  999.99, stock: 28, image: `${CDN}/smartphones/Huawei%20Nova%205T/thumbnail.png`,          desc: 'Leica-tuned quad-camera system with 1" Sony LYT-900 sensor. Professional mobile photography.\n\nBrand: Xiaomi · Color: Titanium Grey · Charging: 90W' },
    { name: 'Motorola Edge 50 Pro',      price:  599.99, stock: 55, image: `${CDN}/smartphones/Huawei%20Nova%205T/thumbnail.png`,          desc: 'Curved pOLED display, 50MP camera with OIS, and 125W TurboPower charging for an all-day phone.\n\nBrand: Motorola · Color: Black Beauty · Storage: 512GB' },
    { name: 'Sony Xperia 1 VI',          price: 1299.99, stock: 20, image: `${CDN}/smartphones/Vivo%20X21/thumbnail.png`,                  desc: '4K HDR OLED Bravia display, Zeiss optics with 85-170mm optical zoom. Creator\'s smartphone.\n\nBrand: Sony · Color: Black · Storage: 256GB · Display: 6.5" 4K OLED' },
  ],

  Laptops: [
    { name: 'MacBook Air 13" M3',        price:  1099.99, stock: 45, image: `${CDN}/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png`, desc: 'Incredibly thin and light with Apple M3 chip, 18-hour battery, and fanless design. Up to 24GB RAM.\n\nBrand: Apple · Chip: M3 · RAM: 8GB · Storage: 256GB SSD · Weight: 1.24kg' },
    { name: 'MacBook Air 15" M3',        price:  1299.99, stock: 35, image: `${CDN}/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png`, desc: 'The world\'s best 15" thin-and-light. M3 chip delivers incredible performance with a massive Liquid Retina display.\n\nBrand: Apple · Chip: M3 · RAM: 8GB · Storage: 256GB SSD · Display: 15.3"' },
    { name: 'MacBook Pro 14" M3 Pro',    price:  1999.99, stock: 25, image: `${CDN}/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png`, desc: 'Professional performance in a portable package. M3 Pro chip with 18GB unified memory and ProMotion display.\n\nBrand: Apple · Chip: M3 Pro · RAM: 18GB · Storage: 512GB SSD' },
    { name: 'MacBook Pro 16" M3 Max',    price:  3499.99, stock: 15, image: `${CDN}/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png`, desc: 'The most powerful MacBook Pro ever. M3 Max with 48GB unified memory and 16-core Neural Engine.\n\nBrand: Apple · Chip: M3 Max · RAM: 48GB · Storage: 1TB SSD · Display: 16.2" Liquid Retina XDR' },
    { name: 'Dell XPS 15',               price:  1799.99, stock: 30, image: `${CDN}/laptops/New%20DELL%20XPS%2013%209300%20Laptop/thumbnail.png`,           desc: 'Premium Windows laptop with InfinityEdge OLED display, Intel Core Ultra 9, and NVIDIA RTX 4070.\n\nBrand: Dell · CPU: Intel Core Ultra 9 · GPU: RTX 4070 · RAM: 16GB · Storage: 512GB' },
    { name: 'Dell XPS 13',               price:   999.99, stock: 40, image: `${CDN}/laptops/New%20DELL%20XPS%2013%209300%20Laptop/thumbnail.png`,           desc: 'Ultra-compact 13" powerhouse with Intel Core Ultra 7, stunning OLED display, and all-day battery life.\n\nBrand: Dell · CPU: Intel Core Ultra 7 · RAM: 16GB · Storage: 512GB SSD' },
    { name: 'HP Spectre x360 14"',       price:  1599.99, stock: 25, image: `${CDN}/laptops/Huawei%20Matebook%20X%20Pro/thumbnail.png`,                     desc: '2-in-1 convertible with OLED touch display, Intel Core Ultra 7, and HP AI features. Premium gem-cut design.\n\nBrand: HP · CPU: Intel Core Ultra 7 · RAM: 16GB · Storage: 1TB SSD · Display: 14" OLED' },
    { name: 'Lenovo ThinkPad X1 Carbon', price:  1699.99, stock: 20, image: `${CDN}/laptops/Lenovo%20Yoga%20920/thumbnail.png`,                              desc: 'Business ultrabook with military-grade durability, Intel vPro, and legendary ThinkPad keyboard.\n\nBrand: Lenovo · CPU: Intel Core Ultra 7 · RAM: 16GB · Storage: 512GB SSD · Weight: 1.12kg' },
    { name: 'Lenovo IdeaPad 5 Pro',      price:   899.99, stock: 50, image: `${CDN}/laptops/Lenovo%20Yoga%20920/thumbnail.png`,                              desc: 'Versatile daily driver with AMD Ryzen 7, 2.8K OLED display, and long battery life.\n\nBrand: Lenovo · CPU: AMD Ryzen 7 7735H · RAM: 16GB · Storage: 512GB SSD · Display: 14" 2.8K OLED' },
    { name: 'ASUS ROG Zephyrus G16',     price:  2299.99, stock: 18, image: `${CDN}/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/thumbnail.png`,    desc: 'Premium gaming laptop with OLED display, RTX 4080, and elegant all-metal chassis. Whisper-quiet fans.\n\nBrand: ASUS · CPU: Intel Core Ultra 9 · GPU: RTX 4080 · RAM: 32GB · Storage: 1TB' },
    { name: 'ASUS ZenBook Pro 15 OLED',  price:  1499.99, stock: 22, image: `${CDN}/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/thumbnail.png`,    desc: 'Creator laptop with stunning 2.8K OLED touch display, AMD Ryzen 9, and NVIDIA RTX 4060.\n\nBrand: ASUS · CPU: AMD Ryzen 9 7940H · GPU: RTX 4060 · RAM: 16GB · Display: 15.6" OLED' },
    { name: 'Microsoft Surface Laptop 5', price: 1299.99, stock: 28, image: `${CDN}/laptops/Huawei%20Matebook%20X%20Pro/thumbnail.png`,                     desc: 'Elegant touchscreen laptop with PixelSense display, Intel Core i7, and premium Alcantara palm rest.\n\nBrand: Microsoft · CPU: Intel Core i7 · RAM: 16GB · Storage: 512GB · Display: 13.5" PixelSense' },
    { name: 'Razer Blade 16',            price:  2799.99, stock: 12, image: `${CDN}/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/thumbnail.png`,    desc: 'Ultimate gaming laptop with dual-mode 4K OLED/1080p 240Hz display, RTX 4090, and CNC aluminum.\n\nBrand: Razer · CPU: Intel Core i9 · GPU: RTX 4090 · RAM: 32GB · Storage: 2TB' },
    { name: 'Acer Swift X 14',           price:   999.99, stock: 35, image: `${CDN}/laptops/Huawei%20Matebook%20X%20Pro/thumbnail.png`,                     desc: 'Powerful creator laptop with AMD Ryzen 7 and NVIDIA RTX 3050, at an accessible price point.\n\nBrand: Acer · CPU: AMD Ryzen 7 · GPU: RTX 3050 · RAM: 16GB · Storage: 512GB SSD' },
    { name: 'LG Gram 17',                price:  1599.99, stock: 20, image: `${CDN}/laptops/Huawei%20Matebook%20X%20Pro/thumbnail.png`,                     desc: 'Lightest 17" laptop in its class at 1.35kg. MIL-SPEC durability, 17-hour battery, 2K IPS display.\n\nBrand: LG · CPU: Intel Core Ultra 7 · RAM: 16GB · Storage: 512GB · Weight: 1.35kg' },
  ],

  Tablets: [
    { name: 'iPad Pro 13" M4',           price: 1299.99, stock: 25, image: `${CDN}/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png`,                    desc: 'Thinnest Apple product ever. Ultra Retina XDR OLED display, M4 chip, and Apple Pencil Pro support.\n\nBrand: Apple · Chip: M4 · Storage: 256GB · Display: 13" Ultra Retina XDR OLED · Connectivity: Wi-Fi 6E' },
    { name: 'iPad Pro 11" M4',           price:  999.99, stock: 35, image: `${CDN}/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png`,                    desc: 'Supercomputer in a superslim 5.1mm chassis. M4 chip with OLED display and Apple Pencil Pro.\n\nBrand: Apple · Chip: M4 · Storage: 256GB · Display: 11" Ultra Retina XDR OLED' },
    { name: 'iPad Air 13" M2',           price:   799.99, stock: 40, image: `${CDN}/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png`,                    desc: 'More screen, more power. M2 chip in a larger Liquid Retina display with Apple Pencil Pro support.\n\nBrand: Apple · Chip: M2 · Storage: 128GB · Display: 13" Liquid Retina · Color: Blue' },
    { name: 'iPad Air 11" M2',           price:   599.99, stock: 55, image: `${CDN}/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png`,                    desc: 'Versatile all-rounder with M2 chip, 11" Liquid Retina display, and USB-C. Perfect student tablet.\n\nBrand: Apple · Chip: M2 · Storage: 128GB · Display: 11" Liquid Retina' },
    { name: 'iPad mini 7',               price:   499.99, stock: 45, image: `${CDN}/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png`,                    desc: 'Powerfully compact. A17 Pro chip in an ultra-portable 8.3" form factor. Apple Intelligence ready.\n\nBrand: Apple · Chip: A17 Pro · Storage: 128GB · Display: 8.3" Liquid Retina' },
    { name: 'iPad 10th Generation',      price:   449.99, stock: 60, image: `${CDN}/tablets/iPad%20Mini%202021%20Starlight/thumbnail.png`,                    desc: 'Redesigned iPad with A14 Bionic, USB-C, and an all-screen design. Great for everyday tasks.\n\nBrand: Apple · Chip: A14 Bionic · Storage: 64GB · Display: 10.9" Liquid Retina · Color: Yellow' },
    { name: 'Samsung Galaxy Tab S9 Ultra', price: 1199.99, stock: 20, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20S8%20Plus%20Grey/thumbnail.png`,       desc: 'Massive 14.6" Dynamic AMOLED, S Pen included, Snapdragon 8 Gen 2, and a 11200mAh battery.\n\nBrand: Samsung · Display: 14.6" AMOLED · RAM: 12GB · Storage: 256GB · S Pen: Included' },
    { name: 'Samsung Galaxy Tab S9+',    price:   999.99, stock: 28, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20S8%20Plus%20Grey/thumbnail.png`,         desc: 'Premium Galaxy tablet with 12.4" AMOLED display, IP68 rating, and S Pen for creative work.\n\nBrand: Samsung · Display: 12.4" AMOLED · RAM: 12GB · Storage: 256GB · IP68' },
    { name: 'Samsung Galaxy Tab S9 FE',  price:   449.99, stock: 50, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20White/thumbnail.png`,                   desc: 'Fan Edition Galaxy Tab with a 10.9" display, long-lasting 8000mAh battery, and S Pen support.\n\nBrand: Samsung · Display: 10.9" TFT · RAM: 6GB · Storage: 128GB · Battery: 8000mAh' },
    { name: 'Microsoft Surface Pro 11',  price:  1499.99, stock: 18, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20S8%20Plus%20Grey/thumbnail.png`,         desc: 'The most versatile 2-in-1 PC. Snapdragon X Elite, Copilot+ AI features, and 13" PixelSense Flow display.\n\nBrand: Microsoft · CPU: Snapdragon X Elite · RAM: 16GB · Storage: 256GB SSD' },
    { name: 'Microsoft Surface Go 4',    price:   599.99, stock: 35, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20White/thumbnail.png`,                   desc: 'Compact and portable 2-in-1 for students and professionals. 10.5" display with Intel N200 processor.\n\nBrand: Microsoft · CPU: Intel N200 · RAM: 8GB · Storage: 128GB · Display: 10.5"' },
    { name: 'Lenovo Tab P12 Pro',        price:   699.99, stock: 30, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20S8%20Plus%20Grey/thumbnail.png`,         desc: 'High-resolution 12.6" AMOLED tablet with Snapdragon 870 and Precision Pen 3 stylus.\n\nBrand: Lenovo · Display: 12.6" AMOLED 2K · RAM: 8GB · Storage: 256GB · Pen: Included' },
    { name: 'Google Pixel Tablet',       price:   499.99, stock: 40, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20White/thumbnail.png`,                   desc: 'Android tablet with Tensor G2 chip and exclusive Charging Speaker Dock for a smart home hub.\n\nBrand: Google · Chip: Tensor G2 · RAM: 8GB · Storage: 128GB · Display: 10.95" LTPS LCD' },
    { name: 'Xiaomi Pad 6 Pro',          price:   499.99, stock: 45, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20White/thumbnail.png`,                   desc: 'Snapdragon 8 Gen 2, 144Hz display refresh rate, and 67W turbocharging at a compelling price.\n\nBrand: Xiaomi · CPU: Snapdragon 8 Gen 2 · RAM: 8GB · Storage: 256GB · Charge: 67W' },
    { name: 'Amazon Fire Max 11',        price:   229.99, stock: 70, image: `${CDN}/tablets/Samsung%20Galaxy%20Tab%20White/thumbnail.png`,                   desc: 'Amazon\'s premium Fire tablet with an 11" 2K display, MediaTek Helio G99, and stylus support.\n\nBrand: Amazon · Display: 11" 2K · RAM: 4GB · Storage: 64GB · Stylus: Compatible' },
  ],

  Audio: [
    { name: 'AirPods Pro 2nd Gen',       price:   249.99, stock: 80, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Industry-leading Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio with MagSafe charging.\n\nBrand: Apple · ANC: Yes · Battery: 6h + 30h case · Chip: H2' },
    { name: 'AirPods 4',                 price:   129.99, stock: 90, image: `${CDN}/mobile-accessories/Apple%20Airpods/thumbnail.png`,                        desc: 'Redesigned AirPods with a new comfortable fit, Transparency mode, and USB-C charging case.\n\nBrand: Apple · Transparency: Yes · Battery: 5h + 30h case · Chip: H2' },
    { name: 'AirPods Max (USB-C)',        price:   549.99, stock: 30, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Over-ear headphones with premium acoustics, ANC, Transparency mode, and computational audio.\n\nBrand: Apple · ANC: Yes · Battery: 20h · Driver: 40mm dynamic · Color: Starlight' },
    { name: 'Sony WH-1000XM5',           price:   349.99, stock: 55, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Industry-leading noise cancellation with 30-hour battery, multipoint connection, and Auto NC Optimizer.\n\nBrand: Sony · ANC: Yes · Battery: 30h · Codec: LDAC · Foldable: No' },
    { name: 'Sony WF-1000XM5',           price:   279.99, stock: 60, image: `${CDN}/mobile-accessories/Apple%20Airpods/thumbnail.png`,                        desc: 'World\'s smallest and lightest earbuds with industry-leading ANC and exceptional sound quality.\n\nBrand: Sony · ANC: Yes · Battery: 8h + 24h case · Codec: LDAC · IPX4' },
    { name: 'Bose QuietComfort 45',      price:   299.99, stock: 45, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Legendary Bose noise cancellation, comfortable fit for all-day wear, and 24-hour battery life.\n\nBrand: Bose · ANC: Yes · Battery: 24h · Color: White Smoke · Weight: 238g' },
    { name: 'Bose QuietComfort Earbuds II', price: 299.99, stock: 40, image: `${CDN}/mobile-accessories/Apple%20Airpods/thumbnail.png`,                      desc: 'Personalised noise cancellation with CustomTune technology and six hours of battery in a compact case.\n\nBrand: Bose · ANC: Yes · Battery: 6h + 24h case · Color: Triple Black · IPX4' },
    { name: 'Samsung Galaxy Buds 3 Pro', price:   249.99, stock: 50, image: `${CDN}/mobile-accessories/Apple%20Airpods/thumbnail.png`,                        desc: 'Galaxy AI-enhanced earbuds with blade-style design, 360° Audio, and intelligent ANC.\n\nBrand: Samsung · ANC: Yes · Battery: 6h + 30h case · 360° Audio: Yes · IPX7' },
    { name: 'Sennheiser Momentum 4',     price:   349.99, stock: 35, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Audiophile-grade sound with 60-hour playtime, Smart Pause, and immersive Adaptive Noise Cancellation.\n\nBrand: Sennheiser · ANC: Yes · Battery: 60h · Codec: aptX Adaptive · Foldable: Yes' },
    { name: 'Jabra Evolve2 85',          price:   449.99, stock: 25, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Professional headset engineered for concentration with Advanced ANC, 10-mic call technology, and 37h battery.\n\nBrand: Jabra · ANC: Yes · Battery: 37h · Mics: 10 · Certified: MS Teams & Google Meet' },
    { name: 'Bang & Olufsen Beoplay H95', price: 849.99, stock: 15, image: `${CDN}/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png`,        desc: 'Ultra-premium headphones with aluminium design, 38-hour battery, and finest leather ear cushions.\n\nBrand: B&O · ANC: Adaptive · Battery: 38h · Material: Aluminium & Leather · Weight: 282g' },
    { name: 'JBL Tune 230NC TWS',        price:    79.99, stock: 100, image: `${CDN}/mobile-accessories/Apple%20Airpods/thumbnail.png`,                      desc: 'True wireless earbuds with Active Noise Cancelling, 10-hour battery, and JBL Pure Bass Sound.\n\nBrand: JBL · ANC: Yes · Battery: 10h + 30h case · IPX4 · Color: Black' },
    { name: 'Sony SRS-XB43',             price:   149.99, stock: 60, image: `${CDN}/mobile-accessories/Apple%20HomePod%20Mini%20Cosmic%20Grey/thumbnail.png`, desc: 'Powerful Bluetooth speaker with EXTRA BASS, 24-hour battery, IP67 waterproof, and Live Sound mode.\n\nBrand: Sony · Battery: 24h · IP67 · EXTRA BASS: Yes · Party Connect: Up to 100 speakers' },
    { name: 'JBL Charge 5',              price:   179.99, stock: 55, image: `${CDN}/mobile-accessories/Apple%20HomePod%20Mini%20Cosmic%20Grey/thumbnail.png`, desc: 'Portable speaker with powerful sound, built-in power bank, IP67 waterproof, and 20-hour battery.\n\nBrand: JBL · Battery: 20h · IP67 · Powerbank: Yes · PartyBoost: Yes' },
    { name: 'Sonos Era 100',             price:   249.99, stock: 35, image: `${CDN}/mobile-accessories/Apple%20HomePod%20Mini%20Cosmic%20Grey/thumbnail.png`, desc: 'Compact smart speaker with stereo sound, Trueplay tuning, Wi-Fi 6, and Bluetooth connectivity.\n\nBrand: Sonos · Audio: Stereo · Wi-Fi: 6 · Bluetooth: Yes · Voice: Amazon Alexa' },
    { name: 'Apple HomePod mini',        price:    99.99, stock: 70, image: `${CDN}/mobile-accessories/Apple%20HomePod%20Mini%20Cosmic%20Grey/thumbnail.png`, desc: 'Smart home hub with surprisingly rich 360° audio, Siri intelligence, and seamless Apple ecosystem integration.\n\nBrand: Apple · Audio: 360° · Chip: S5 · Color: Space Grey · Smart Home: Thread, HomeKit' },
  ],
};

// DummyJSON category slug → our category name
const DUMMY_CATEGORY_MAP = {
  'smartphones':        'Smartphones',
  'laptops':            'Laptops',
  'tablets':            'Tablets',
  'mobile-accessories': 'Audio', // filtered to audio items
};

const AUDIO_KEYWORDS = ['airpod', 'beats', 'echo', 'homepod', 'speaker', 'headphone', 'earphone', 'earbuds', 'bose', 'audio', 'sound', 'wireless earphone', 'bluetooth speaker'];

function isAudioProduct(name) {
  const lower = name.toLowerCase();
  return AUDIO_KEYWORDS.some(kw => lower.includes(kw));
}

async function fetchDummyProducts() {
  console.log('  Fetching products from DummyJSON...');
  const byCategory = { Smartphones: [], Laptops: [], Tablets: [], Audio: [] };

  for (const [slug, catName] of Object.entries(DUMMY_CATEGORY_MAP)) {
    try {
      const data = await getJson(`https://dummyjson.com/products/category/${slug}?limit=30`);
      const products = data.products || [];
      console.log(`    ${slug}: ${products.length} products`);
      for (const p of products) {
        const targetCat = slug === 'mobile-accessories'
          ? (isAudioProduct(p.title) ? 'Audio' : null) // skip non-audio accessories
          : catName;
        if (targetCat) byCategory[targetCat].push({ ...p, _cat: targetCat });
      }
      await sleep(300);
    } catch (err) {
      console.log(`    ⚠  Failed to fetch "${slug}": ${err.message}`);
    }
  }

  const totals = Object.entries(byCategory).map(([k, v]) => `${k}: ${v.length}`).join(', ');
  console.log(`  DummyJSON fetched — ${totals}\n`);
  return byCategory;
}

function mapDummyProduct(p, categoryId) {
  const specs = [
    p.brand       ? `Brand: ${p.brand}`             : null,
    p.model       ? `Model: ${p.model}`              : null,
    p.color       ? `Color: ${p.color}`              : null,
    p.weight      ? `Weight: ${p.weight}g`           : null,
    p.warrantyInformation  || null,
    p.shippingInformation  || null,
  ].filter(Boolean);

  const base = p.description || `${p.title} — a premium electronics product.`;
  const description = specs.length ? `${base}\n\n${specs.join(' · ')}` : base;
  const price = Math.max(0.01, Math.round((p.price || 9.99) * 100) / 100);
  const stock = Math.min(p.stock ?? 50, 150);

  return {
    id: null, name: p.title, price, imageUrl: p.thumbnail || null,
    description, categoryName: p._cat, categoryId,
    stock, videoPath: null, imagePaths: [], createdAt: null, featured: false,
  };
}

function buildSupplementalProduct(data, catName, categoryId) {
  return {
    id: null, name: data.name, price: data.price, imageUrl: data.image,
    description: data.desc, categoryName: catName, categoryId,
    stock: data.stock, videoPath: null, imagePaths: [], createdAt: null, featured: false,
  };
}

async function seedProducts(products, token) {
  let success = 0, failed = 0;
  for (const product of products) {
    try {
      const res = await apiRequest('POST', '/api/admin/products', product, token);
      if (res.status === 200 || res.status === 201) {
        success++;
        process.stdout.write(`\r    Progress: ${success + failed}/${products.length}  ✓ ${product.name.slice(0, 45).padEnd(45)}`);
      } else {
        failed++;
        console.log(`\n    ✗ ${product.name}: ${res.status} — ${JSON.stringify(res.body).slice(0, 100)}`);
      }
    } catch (err) {
      failed++;
      console.log(`\n    ✗ ${product.name}: ${err.message}`);
    }
    await sleep(60);
  }
  console.log('');
  return { success, failed };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(60));
  console.log('  Estoré — Full Catalog Reseed');
  console.log('═'.repeat(60) + '\n');

  // Auth
  let token;
  try {
    token = await login();
    console.log('  ✓ Logged in\n');
  } catch (err) {
    console.error(`\n  ERROR: ${err.message}`);
    console.error('  Is the backend running? ( cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev )');
    process.exit(1);
  }

  // Phase 1
  console.log('── Phase 1: Deleting existing products ─────────────────────\n');
  await deleteAllProducts(token);

  // Phase 2
  console.log('── Phase 2: Upserting categories ────────────────────────────\n');
  const categoryIds = await upsertCategories(token);

  // Phase 3
  console.log('── Phase 3: Seeding products ─────────────────────────────────\n');
  const dummyByCategory = await fetchDummyProducts();

  // Build final product list per category
  const allProducts = [];
  for (const catName of ['Smartphones', 'Laptops', 'Tablets', 'Audio']) {
    const catId = categoryIds[catName];
    if (!catId) { console.log(`  ⚠  Skipping ${catName} — no category ID`); continue; }

    // DummyJSON products first
    const dummy = (dummyByCategory[catName] || []).map(p => mapDummyProduct(p, catId));

    // Supplemental products (those not already in DummyJSON by name)
    const dummyNames = new Set(dummy.map(p => p.name.toLowerCase()));
    const supplemental = (SUPPLEMENTAL[catName] || [])
      .filter(s => !dummyNames.has(s.name.toLowerCase()))
      .map(s => buildSupplementalProduct(s, catName, catId));

    const combined = [...dummy, ...supplemental];
    console.log(`  ${catName}: ${dummy.length} from DummyJSON + ${supplemental.length} supplemental = ${combined.length} total`);
    allProducts.push(...combined);
  }

  console.log(`\n  Seeding ${allProducts.length} products...\n`);
  const { success, failed } = await seedProducts(allProducts, token);

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('  Reseed complete!');
  console.log(`  ✓ Created  : ${success} products`);
  if (failed > 0) console.log(`  ✗ Failed   : ${failed}`);
  console.log('─'.repeat(60));
  console.log('\n  Open http://localhost:4200/products to see the results.\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
