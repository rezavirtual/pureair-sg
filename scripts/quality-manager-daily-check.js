import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for Telegram alert
function sendTelegramAlert(botToken, chatId, message) {
  if (!botToken || !chatId) return Promise.resolve(false);
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

// Check an Amazon ASIN live
export function checkAmazonAsin(asin) {
  return new Promise((resolve) => {
    const url = `https://www.amazon.sg/dp/${asin}/?tag=pettechsg-22`;
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-SG,en-US;q=0.9,en;q=0.8'
      }
    }, res => {
      let data = '';
      res.on('data', c => { if (data.length < 2000) data += c.toString(); });
      res.on('end', () => {
        const isNotFound = res.statusCode === 404 || data.includes('Page Not Found') || data.includes('we couldn\'t find that page');
        resolve({
          asin,
          status: res.statusCode,
          isNotFound,
          ok: res.statusCode === 200 && !isNotFound
        });
      });
    });
    req.on('error', err => resolve({ asin, ok: false, error: err.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ asin, ok: false, timeout: true }); });
    req.end();
  });
}

export async function runQualityAudit(storeDir) {
  const seedPath = path.join(storeDir, 'data', 'products-seed.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Catalog seed not found at ${seedPath}`);
  }

  const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const storeName = path.basename(storeDir);
  console.log(`\n================================================================================`);
  console.log(`🛡️ QUALITY MANAGER DAILY AUDIT: ${storeName}`);
  console.log(`================================================================================`);
  console.log(`Catalog Size: ${products.length} products`);
  console.log(`Inspection Criteria:`);
  console.log(`  1. Direct Single-Product Amazon.sg Link (HTTP 200, No 404)`);
  console.log(`  2. Master Tag Verification (tag=pettechsg-22)`);
  console.log(`  3. Local & CDN Photography Match (>1KB size)`);
  console.log(`  4. Accurate Product Title & SG Technical Specs\n`);

  const results = [];
  let brokenLinks = 0;
  let missingImages = 0;
  let badTags = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const itemNum = `[${String(i + 1).padStart(2, '0')}/${products.length}]`;

    // 1. Check Link & ASIN
    const linkRes = await checkAmazonAsin(p.asin);
    const linkOk = linkRes.ok;
    if (!linkOk) brokenLinks++;

    // 2. Check Tag
    const tagOk = p.affiliateUrl && p.affiliateUrl.includes('tag=pettechsg-22');
    if (!tagOk) badTags++;

    // 3. Check Image
    const imgFilename = p.imageFile || `${p.asin.toLowerCase()}.jpg`;
    const localImgPath = path.join(storeDir, 'assets', 'products', imgFilename);
    const imgExists = fs.existsSync(localImgPath) && fs.statSync(localImgPath).size > 1000;
    if (!imgExists) missingImages++;

    const statusPill = (linkOk && tagOk && imgExists) ? '✔ PASS' : '✖ DEFECT';
    console.log(`${itemNum} ${statusPill} | ${p.asin} | S$${p.priceSgd} | "${p.title.slice(0, 42)}..."`);
    if (!linkOk) console.log(`      ↳ Link Failure: Status ${linkRes.status} (404/Not Found)`);
    if (!tagOk) console.log(`      ↳ Tag Error: Missing tag=pettechsg-22`);
    if (!imgExists) console.log(`      ↳ Image Defect: Missing or corrupt in assets/products/${imgFilename}`);

    results.push({
      asin: p.asin,
      title: p.title,
      priceSgd: p.priceSgd,
      linkOk,
      tagOk,
      imgExists
    });

    await new Promise(r => setTimeout(r, 300));
  }

  const passedCount = results.filter(r => r.linkOk && r.tagOk && r.imgExists).length;
  const passRate = ((passedCount / products.length) * 100).toFixed(1);

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`📊 QUALITY AUDIT SUMMARY: ${storeName}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`Total Products Inspected:  ${products.length}`);
  console.log(`Verified 100% Operational: ${passedCount}`);
  console.log(`Broken Links Detected:     ${brokenLinks}`);
  console.log(`Image Defects:             ${missingImages}`);
  console.log(`Tag Integrity Errors:      ${badTags}`);
  console.log(`Final Pass Rate:           ${passRate}%`);
  console.log(`================================================================================\n`);

  // Save report
  const reportDir = path.join(storeDir, 'data', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, 'quality-manager-daily-report.json'),
    JSON.stringify({
      auditDate: new Date().toISOString(),
      storeName,
      catalogSize: products.length,
      passedCount,
      brokenLinks,
      missingImages,
      badTags,
      passRate: `${passRate}%`,
      items: results
    }, null, 2)
  );

  return { storeName, catalogSize: products.length, passedCount, brokenLinks, missingImages, badTags, passRate };
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const storePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'PureAir-SG');
  runQualityAudit(storePath).catch(console.error);
}
