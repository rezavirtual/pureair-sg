import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TAG = process.env.AMAZON_ASSOCIATE_TAG || 'pettechsg-22';
const seedPath = path.join(ROOT, 'data', 'products-seed.json');

if (!fs.existsSync(seedPath)) {
  console.log(`[Stock Healer] No products-seed.json found at ${seedPath}`);
  process.exit(0);
}

const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
console.log(`================================================================`);
console.log(`[AUTONOMOUS STOCK HEALER] Checking ${products.length} SKUs against Amazon.sg...`);
console.log(`Master Tag: ${TAG}`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`================================================================`);

async function checkStock(asin) {
  try {
    const url = `https://www.amazon.sg/dp/${asin}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-SG,en;q=0.9'
      }
    });
    if (!res.ok) return { inStock: false, status: res.status };
    const html = await res.text();
    const isOOS = html.includes('Currently unavailable');
    return { inStock: !isOOS, status: 200 };
  } catch (err) {
    return { inStock: false, error: err.message };
  }
}

let healedCount = 0;
let inStockCount = 0;
let outOfStockCount = 0;

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const { inStock } = await checkStock(p.asin);

  if (inStock) {
    inStockCount++;
    p.inStock = true;
    p.affiliateUrl = `https://www.amazon.sg/dp/${p.asin}/?tag=${TAG}&linkCode=ogi&th=1&psc=1`;
    console.log(`✔ [IN-STOCK] ${p.asin} - ${p.title?.slice(0, 40)}`);
  } else {
    outOfStockCount++;
    p.inStock = false;
    const searchKeywords = encodeURIComponent(`${p.brand || ''} ${p.category || 'pet tech'}`.trim());
    p.affiliateUrl = `https://www.amazon.sg/s?k=${searchKeywords}&tag=${TAG}&linkCode=ogi`;
    healedCount++;
    console.log(`⚡ [HEALED -> FALLBACK] ${p.asin} is out of stock. Routed to live Amazon.sg category search.`);
  }

  await new Promise(r => setTimeout(r, 150));
}

fs.writeFileSync(seedPath, JSON.stringify(products, null, 2), 'utf8');

const reportsDir = path.join(ROOT, 'data', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
const reportPath = path.join(reportsDir, 'daily-stock-health.json');
fs.writeFileSync(reportPath, JSON.stringify({
  lastAudit: new Date().toISOString(),
  total: products.length,
  inStock: inStockCount,
  outOfStock: outOfStockCount,
  healedWithSmartFallback: healedCount
}, null, 2), 'utf8');

console.log(`================================================================`);
console.log(`[HEAL COMPLETE] In-Stock: ${inStockCount} | Healed with Fallbacks: ${healedCount} / ${products.length}`);
console.log(`================================================================`);
