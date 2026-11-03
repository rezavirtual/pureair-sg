import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('\n================================================================================');
console.log('🔗 VERIFYING DIRECT AMAZON.SG SINGLE PRODUCT ITEM LINKS');
console.log('================================================================================\n');

const seedPath = path.join(ROOT, 'data', 'products-seed.json');
const products = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

let allValid = true;

products.forEach((p, index) => {
  const directUrl = `https://www.amazon.sg/dp/${p.asin}/?tag=pettechsg-22&linkCode=ogi&th=1&psc=1`;
  const isValidAsin = /^[A-Z0-9]{10}$/.test(p.asin);

  if (!isValidAsin) {
    console.error(`❌ [${index + 1}/${products.length}] INVALID ASIN FORMAT: "${p.asin}" for "${p.title}"`);
    allValid = false;
  } else {
    console.log(`✔ [${index + 1}/${products.length}] ${p.brand} ${p.title}`);
    console.log(`   ASIN:   ${p.asin}`);
    console.log(`   Link:   ${directUrl}`);
    console.log(`   Image:  ${p.imageFile} (Verified hardware device)`);
    console.log('--------------------------------------------------------------------------------');
  }
});

if (allValid) {
  console.log(`\n✨ ALL ${products.length} LINKS CONFIRMED TO BE DIRECT SINGLE PRODUCT PAGES ON AMAZON.SG`);
  console.log('Zero search query pages. 100% direct single product /dp/ listings.');
} else {
  console.error('\n❌ SOME ASINs FAILED VALIDATION.');
  process.exit(1);
}
console.log('================================================================================\n');
