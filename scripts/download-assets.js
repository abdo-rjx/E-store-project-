/**
 * Pexels Asset Downloader
 * Downloads product images + videos into backend/src/main/resources/static/uploads/
 *
 * Usage:
 *   1. Get a free API key at https://www.pexels.com/api/  (takes 2 minutes)
 *   2. Paste it below
 *   3. node scripts/download-assets.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const PEXELS_API_KEY = 'O5AWSvkqmHOro0ZyZmrEN8T6qbQZbPFyWx3QSOg9MAAH8SDx0srjWJeA';

const UPLOAD_ROOT = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'static', 'uploads');
const IMAGES_DIR  = path.join(UPLOAD_ROOT, 'images');
const VIDEOS_DIR  = path.join(UPLOAD_ROOT, 'videos');

// Images to download per category (max 80 free requests/run to stay safe)
const IMAGE_SEARCHES = [
  { query: 'smartphone product',          count: 10, prefix: 'phone'     },
  { query: 'laptop computer product',     count: 10, prefix: 'laptop'    },
  { query: 'wireless headphones product', count: 8,  prefix: 'audio'     },
  { query: 'smartwatch product',          count: 8,  prefix: 'watch'     },
  { query: 'camera dslr product',         count: 6,  prefix: 'camera'    },
  { query: 'television smart tv',         count: 6,  prefix: 'tv'        },
  { query: 'tablet device product',       count: 6,  prefix: 'tablet'    },
  { query: 'tech accessories gadget',     count: 6,  prefix: 'accessory' },
];

// Showcase images referenced directly in home.component.ts
const SHOWCASE_IMAGES = [
  { query: 'television mockup screen',    filename: 'Chat.png'  },
  { query: 'headphones three colors',     filename: 'kk.png'    },
];

// Videos for the cinema slider and video reveal section
const VIDEO_SEARCHES = [
  { query: 'smartphone technology',  count: 2, prefix: 'phone'  },
  { query: 'laptop technology',      count: 1, prefix: 'laptop' },
  { query: 'technology product',     count: 2, prefix: 'tech'   },
];
// ──────────────────────────────────────────────────────────────────────────────

function ensureDirs() {
  [IMAGES_DIR, VIDEOS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return fetchJson(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const proto = fileUrl.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = proto.get(fileUrl, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode} for ${fileUrl}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    request.on('error', err => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(new Error('Download timeout'));
    });
  });
}

async function downloadImages() {
  console.log('\n📷  Downloading product images...\n');
  let total = 0;

  for (const { query, count, prefix } of IMAGE_SEARCHES) {
    console.log(`  Searching: "${query}" (${count} images)`);

    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
      const data = await fetchJson(url, { Authorization: PEXELS_API_KEY });

      if (!data.photos?.length) {
        console.log(`    ⚠  No results for "${query}"`);
        continue;
      }

      for (let i = 0; i < data.photos.length; i++) {
        const photo = data.photos[i];
        const imgUrl = photo.src.large;          // ~1280px — good quality, not too large
        const ext = imgUrl.split('?')[0].split('.').pop() || 'jpg';
        const filename = `${prefix}_${photo.id}.${ext}`;
        const destPath = path.join(IMAGES_DIR, filename);

        if (fs.existsSync(destPath)) {
          console.log(`    ✓ exists: ${filename}`);
          continue;
        }

        try {
          await downloadFile(imgUrl, destPath);
          const kb = Math.round(fs.statSync(destPath).size / 1024);
          console.log(`    ↓ ${filename}  (${kb} KB)`);
          total++;
          await sleep(150);                       // polite delay
        } catch (err) {
          console.log(`    ✗ failed: ${filename} — ${err.message}`);
        }
      }

      await sleep(300);
    } catch (err) {
      console.log(`    ✗ Search failed for "${query}": ${err.message}`);
    }
  }

  return total;
}

async function downloadShowcaseImages() {
  console.log('\n🖼   Downloading showcase images (home page)...\n');

  for (const { query, filename } of SHOWCASE_IMAGES) {
    const destPath = path.join(IMAGES_DIR, filename);
    if (fs.existsSync(destPath)) {
      console.log(`  ✓ exists: ${filename}`);
      continue;
    }

    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
      const data = await fetchJson(url, { Authorization: PEXELS_API_KEY });

      if (!data.photos?.length) {
        console.log(`  ⚠  No results for "${query}" (${filename} skipped)`);
        continue;
      }

      const imgUrl = data.photos[0].src.large2x || data.photos[0].src.large;
      await downloadFile(imgUrl, destPath);
      const kb = Math.round(fs.statSync(destPath).size / 1024);
      console.log(`  ↓ ${filename}  (${kb} KB)`);
      await sleep(300);
    } catch (err) {
      console.log(`  ✗ failed: ${filename} — ${err.message}`);
    }
  }
}

async function downloadVideos() {
  console.log('\n🎬  Downloading videos for cinema slider...\n');
  let total = 0;

  for (const { query, count, prefix } of VIDEO_SEARCHES) {
    console.log(`  Searching: "${query}" (${count} videos)`);

    try {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count + 2}&size=medium`;
      const data = await fetchJson(url, { Authorization: PEXELS_API_KEY });

      if (!data.videos?.length) {
        console.log(`    ⚠  No results for "${query}"`);
        continue;
      }

      let downloaded = 0;
      for (const video of data.videos) {
        if (downloaded >= count) break;

        // Pick the HD or SD file (avoid huge 4K files)
        const file = video.video_files
          .filter(f => f.link && (f.quality === 'hd' || f.quality === 'sd'))
          .sort((a, b) => (b.width || 0) - (a.width || 0))
          .find(f => (f.width || 9999) <= 1920);

        if (!file) continue;

        const filename = `${prefix}_${video.id}.mp4`;
        const destPath = path.join(VIDEOS_DIR, filename);

        if (fs.existsSync(destPath)) {
          console.log(`    ✓ exists: ${filename}`);
          downloaded++;
          continue;
        }

        try {
          console.log(`    ↓ ${filename} (downloading...)`);
          await downloadFile(file.link, destPath);
          const mb = (fs.statSync(destPath).size / 1024 / 1024).toFixed(1);
          console.log(`      ✓ saved  (${mb} MB)`);
          total++;
          downloaded++;
          await sleep(500);
        } catch (err) {
          console.log(`    ✗ failed: ${filename} — ${err.message}`);
        }
      }

      await sleep(400);
    } catch (err) {
      console.log(`    ✗ Search failed for "${query}": ${err.message}`);
    }
  }

  return total;
}

function printSummary(imageCount, videoCount) {
  const allImages = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR).length : 0;
  const allVideos = fs.existsSync(VIDEOS_DIR)  ? fs.readdirSync(VIDEOS_DIR).length  : 0;

  console.log('\n' + '─'.repeat(50));
  console.log('  Download complete!');
  console.log(`  Images in session : ${imageCount}`);
  console.log(`  Videos in session : ${videoCount}`);
  console.log(`  Total images now  : ${allImages}`);
  console.log(`  Total videos now  : ${allVideos}`);
  console.log(`  Saved to          : ${UPLOAD_ROOT}`);
  console.log('─'.repeat(50));
  console.log('\n  Next step: run  node scripts/seed-products.js\n');
}

async function main() {
  if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
    console.error('\n  ERROR: Please set your Pexels API key at the top of this file.');
    console.error('  Get a free key at https://www.pexels.com/api/\n');
    process.exit(1);
  }

  console.log('═'.repeat(50));
  console.log('  Estoré — Pexels Asset Downloader');
  console.log('═'.repeat(50));

  ensureDirs();

  const imageCount = await downloadImages();
  await downloadShowcaseImages();
  const videoCount = await downloadVideos();

  printSummary(imageCount, videoCount);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
