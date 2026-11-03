import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('\n================================================================================');
console.log('🔍 GLOWDEVICE SG: INTEGRITY & END-TO-END VALIDATION SUITE');
console.log('================================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
  }
}

// 1. Data Files
console.log('[1/5] Validating Data Sources & Schema...');
const seedPath = path.join(ROOT, 'data', 'products-seed.json');
assert(fs.existsSync(seedPath), 'products-seed.json exists');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
assert(seed.length >= 12, `Contains ${seed.length} high-ticket ergonomic products (expected >= 12)`);
assert(seed.every(p => p.asin && p.priceSgd && p.categorySlug && p.singaporeSpecs), 'All seed products have ASIN, SGD price, category, and Singapore specs');

const ledgerPath = path.join(ROOT, 'data', 'api-budget-ledger.json');
assert(fs.existsSync(ledgerPath), 'api-budget-ledger.json exists');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
assert(ledger.maxBudgetSgd === 5.0 && ledger.hardHaltLimitSgd === 4.25, 'Budget limit S$5.00 SGD & 85% halt limit S$4.25 SGD verified');
assert(ledger.status === 'HEALTHY', `Budget status is HEALTHY (Spend: S$${ledger.totalCostSgd.toFixed(4)} SGD)`);

const metricsPath = path.join(ROOT, 'data', 'affiliate-metrics.json');
assert(fs.existsSync(metricsPath), 'affiliate-metrics.json exists');

// 2. Netlify Deployment Output
console.log('\n[2/5] Validating Netlify Static Site Build (/dist) & Package Integrity...');
const distPath = path.join(ROOT, 'dist');
assert(fs.existsSync(path.join(distPath, 'index.html')), 'dist/index.html generated');
assert(fs.existsSync(path.join(distPath, 'netlify.toml')), 'dist/netlify.toml exists');
assert(fs.existsSync(path.join(distPath, '_redirects')), 'dist/_redirects exists');
assert(fs.existsSync(path.join(distPath, 'assets', 'styles.css')), 'dist/assets/styles.css exists');

const zipPath = path.join(ROOT, 'glowdevice-dist.zip');
assert(fs.existsSync(zipPath), 'glowdevice-dist.zip distribution package exists');

// 3. SEO Buyer Guides & Schema
console.log('\n[3/5] Validating Singapore SEO Buyer Guides & Rich Schema...');
const guidesPath = path.join(distPath, 'guides');
assert(fs.existsSync(path.join(guidesPath, 'best-compact-standing-desks-singapore-hdb.html')), 'Guide 1: Compact HDB beauty tech devices generated');
assert(fs.existsSync(path.join(guidesPath, 'best-breathable-mesh-office-chairs-singapore-heat.html')), 'Guide 2: Breathable mesh chairs generated');
assert(fs.existsSync(path.join(guidesPath, 'dual-monitor-arm-desk-setup-guide-singapore.html')), 'Guide 3: Dual monitor arm setup guide generated');

// 4. Mobile Dashboard
console.log('\n[4/5] Validating Mobile Management Dashboard (/dashboard/)...');
assert(fs.existsSync(path.join(ROOT, 'dashboard', 'index.html')), 'Source dashboard/index.html exists');
assert(fs.existsSync(path.join(distPath, 'dashboard', 'index.html')), 'Live dist/dashboard/index.html compiled');

// 5. Amazon Affiliate Tracking Tags
console.log('\n[5/5] Validating Amazon.sg Affiliate Tag Alignment...');
assert(seed.every(p => p.affiliateUrl.includes('tag=pettechsg-22')), 'All 14 products strictly carry localized associate tag: pettechsg-22');

console.log('\n================================================================================');
console.log(`VALIDATION RESULT: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log('================================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
