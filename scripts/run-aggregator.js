import { BudgetGuard } from '../src/budget-guard.js';
import { AmazonPAAPIClient } from '../src/amazon-paapi.js';
import { ContentGenerator } from '../src/content-generator.js';
import { SiteBuilder } from '../src/site-builder.js';
import { CONFIG } from '../src/config.js';

async function main() {
  console.log('\n================================================================================');
  console.log('⚡ GLOWDEVICE SG: AUTONOMOUS AMAZON.SG AFFILIATE AGGREGATOR PIPELINE');
  console.log('Target Market: Singapore (Amazon.sg) | Currency: SGD (S$) | Niche: Beauty & Personal Care Tech');
  console.log('================================================================================\n');

  const budgetGuard = new BudgetGuard();
  const ledger = budgetGuard.getLedger();

  console.log(`[Budget Sentinel] Status: \x1b[32m${ledger.status}\x1b[0m`);
  console.log(`[Budget Sentinel] Current API Spend: S$${ledger.totalCostSgd.toFixed(4)} SGD`);
  console.log(`[Budget Sentinel] Allocated Budget:  S$${ledger.maxBudgetSgd.toFixed(2)} SGD (Halt limit: S$${ledger.hardHaltLimitSgd.toFixed(2)} SGD)\n`);

  budgetGuard.assertBudgetAvailable(0.01);

  // 1. Fetch High-Yield Ergonomic Hardware
  const paapiClient = new AmazonPAAPIClient();
  const products = await paapiClient.fetchProducts();
  console.log(`\n\x1b[32m✔ Loaded ${products.length} verified ergonomic hardware items from Amazon.sg feed.\x1b[0m\n`);

  // 2. Synthesize SEO Reviews via Content Generator
  const contentGen = new ContentGenerator(budgetGuard);
  const enrichedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] Processing "${p.title}" (ASIN: ${p.asin}, Price: S$${p.priceSgd.toFixed(2)})...`);
    
    const review = await contentGen.generateSingaporeProductReview(p);
    enrichedProducts.push({
      ...p,
      review
    });
  }

  // 3. Compile Static HTML Site for Netlify Deployment
  const siteBuilder = new SiteBuilder();
  const buildResult = await siteBuilder.buildStaticSite(enrichedProducts);

  // 4. Final Ledger & Telemetry Summary
  const finalLedger = budgetGuard.getLedger();
  console.log('\n================================================================================');
  console.log('✨ GLOWDEVICE SG BUILD COMPLETED SUCCESSFULLY');
  console.log('================================================================================');
  console.log(`Static Files Output:   ${buildResult.distPath}`);
  console.log(`Netlify Config:        dist/netlify.toml & dist/_redirects created`);
  console.log(`Total Products Built:  ${enrichedProducts.length}`);
  console.log(`API Calls Executed:    ${finalLedger.totalCalls}`);
  console.log(`Final API Billing:     S$${finalLedger.totalCostSgd.toFixed(4)} SGD`);
  console.log(`Budget Health:         ${finalLedger.status} (Remaining: S$${(finalLedger.maxBudgetSgd - finalLedger.totalCostSgd).toFixed(4)} SGD)`);
  console.log('================================================================================\n');
}

main().catch(err => {
  console.error('\n\x1b[31mFatal Aggregator Error:\x1b[0m', err.message);
  process.exit(1);
});
