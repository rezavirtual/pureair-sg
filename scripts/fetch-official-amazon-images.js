import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const seedPath = path.join(ROOT, 'data', 'products-seed.json');
const products = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const assetsDir = path.join(ROOT, 'assets', 'products');
const distAssetsDir = path.join(ROOT, 'dist', 'assets', 'products');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(distAssetsDir)) fs.mkdirSync(distAssetsDir, { recursive: true });

async function extractOfficialImageUrl(asin) {
  const url = `https://www.amazon.sg/dp/${asin}/`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-SG,en;q=0.9'
      }
    });

    if (res.status !== 200) return null;
    const html = await res.text();

    const hiResMatch = html.match(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i);
    if (hiResMatch && hiResMatch[1]) return hiResMatch[1];

    const oldHiresMatch = html.match(/data-old-hires="([^"]+)"/i);
    if (oldHiresMatch && oldHiresMatch[1] && oldHiresMatch[1].startsWith('http')) return oldHiresMatch[1];

    const largeMatch = html.match(/"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i);
    if (largeMatch && largeMatch[1]) return largeMatch[1];

    const dynamicMatch = html.match(/data-a-dynamic-image="\{&quot;(https:\/\/m\.media-amazon\.com\/images\/I\/[^&]+)&quot;/i);
    if (dynamicMatch && dynamicMatch[1]) return dynamicMatch[1];

    const landingMatch = html.match(/id="landingImage"[^>]*src="([^"]+)"/i);
    if (landingMatch && landingMatch[1] && landingMatch[1].startsWith('http')) return landingMatch[1];

    const ldJsonMatch = html.match(/"image"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i);
    if (ldJsonMatch && ldJsonMatch[1]) return ldJsonMatch[1];

    return null;
  } catch (err) {
    return null;
  }
}

async function downloadImage(imgUrl, destPath) {
  const res = await fetch(imgUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading image`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function main() {
  console.log('================================================================================');
  console.log(`📸 DOWNLOADING OFFICIAL PRODUCT IMAGES FOR ${products.length} ITEMS`);
  console.log('================================================================================\n');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] Downloading [${p.asin}] ${p.title.substring(0, 45)}...`);

    let imgUrl = await extractOfficialImageUrl(p.asin);
    if (!imgUrl) {
      imgUrl = p.imageUrl || p.officialImageUrl;
      console.log(`  Using seed Amazon CDN image: ${imgUrl}`);
    } else {
      console.log(`  Extracted live Amazon image: ${imgUrl}`);
    }

    const filename = `${p.asin.toLowerCase()}.jpg`;
    const targetPath1 = path.join(assetsDir, filename);
    const targetPath2 = path.join(distAssetsDir, filename);

    try {
      await downloadImage(imgUrl, targetPath1);
      fs.copyFileSync(targetPath1, targetPath2);
      const size = fs.statSync(targetPath1).size;
      console.log(`  ✔ Saved ${filename} (${size} bytes)`);
      p.imageFile = filename;
      p.officialImageUrl = imgUrl;
    } catch (err) {
      console.warn(`  ⚠ Download failed for ${p.asin}:`, err.message);
    }
  }

  fs.writeFileSync(seedPath, JSON.stringify(products, null, 2), 'utf-8');
  console.log('\n✔ All images synchronized successfully!');
}

main();
