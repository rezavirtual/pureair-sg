import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { SiteBuilder } from './site-builder.js';
import { ContentGenerator } from './content-generator.js';
import { AmazonPAAPIClient } from './amazon-paapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export class ProfitOptimizer {
  constructor(seedPath = CONFIG.paths.productFeed) {
    this.seedPath = seedPath;
    this.actionsPath = path.join(ROOT, 'data', 'recommended-actions.json');
    this.metricsPath = path.join(ROOT, 'data', 'affiliate-metrics.json');
    this.paapi = new AmazonPAAPIClient();
  }

  /**
   * Calculates Expected Commission Value (ECV) and Profit Index for each product
   */
  calculateProfitMetrics(products) {
    return products.map(p => {
      const commissionPerSale = +(p.priceSgd * p.commissionRate).toFixed(2);
      const affiliateUrl = p.affiliateUrl || this.paapi.localizeAffiliateLink(p.asin);
      
      // Estimated conversion probability based on price tier & social proof
      let baseCv = 0.055;
      if (p.priceSgd < 40) baseCv = 0.105; // High velocity impulse buy
      else if (p.priceSgd < 80) baseCv = 0.075;
      else if (p.priceSgd < 150) baseCv = 0.055;
      else baseCv = 0.038; // High-ticket consideration

      // Adjust for review volume and star rating
      const socialProofMultiplier = (p.rating / 5.0) * Math.min(1.2, 0.8 + Math.log10(p.reviewCount || 1000) / 10);
      const effectiveCv = +(baseCv * socialProofMultiplier).toFixed(4);
      
      // Expected Commission Yield per 100 visitors
      const expectedYieldPer100Clicks = +(commissionPerSale * effectiveCv * 100).toFixed(2);
      
      return {
        ...p,
        affiliateUrl,
        commissionPerSaleSgd: commissionPerSale,
        effectiveCv,
        expectedYieldPer100Clicks
      };
    });
  }

  /**
   * Strategically orders catalog for maximum conversion & commission capture:
   * 1. High-yield Hero GPS tracker
   * 2. High-velocity impulse cookie-trigger (< S$40)
   * 3. Essential daily feeder / water fountain
   * 4. Balanced progression across categories
   */
  optimizeCatalogRanking(products) {
    const scored = this.calculateProfitMetrics(products);

    // Separate by role
    const highTickets = scored.filter(p => p.isHighTicket).sort((a, b) => b.expectedYieldPer100Clicks - a.expectedYieldPer100Clicks);
    const budgetPicks = scored.filter(p => p.isBudgetPick).sort((a, b) => b.effectiveCv - a.effectiveCv);
    const midTiers = scored.filter(p => !p.isHighTicket && !p.isBudgetPick).sort((a, b) => b.expectedYieldPer100Clicks - a.expectedYieldPer100Clicks);

    const optimized = [];
    const usedAsins = new Set();

    function pushUnique(item) {
      if (item && !usedAsins.has(item.asin)) {
        usedAsins.add(item.asin);
        optimized.push(item);
      }
    }

    // Top 3 Hero Trio: High-Ticket anchor + Impulse Cookie Trigger + Essential Feeder
    if (highTickets.length > 0) pushUnique(highTickets[0]);
    if (budgetPicks.length > 0) pushUnique(budgetPicks[0]);
    if (midTiers.length > 0) pushUnique(midTiers[0]);

    // Interleave remaining products to balance price variety and category interest
    const remaining = scored.filter(p => !usedAsins.has(p.asin)).sort((a, b) => b.expectedYieldPer100Clicks - a.expectedYieldPer100Clicks);
    for (const item of remaining) {
      pushUnique(item);
    }

    return optimized;
  }

  /**
   * Executes autonomous profit optimization and site rebuild
   */
  async executeOptimization() {
    console.log('\n\x1b[35m[Sales & Marketing Manager]\x1b[0m Analyzing catalog profit yields & conversion triggers...');
    const rawData = JSON.parse(fs.readFileSync(this.seedPath, 'utf-8'));
    const optimizedProducts = this.optimizeCatalogRanking(rawData);

    // Save re-ranked catalog
    fs.writeFileSync(this.seedPath, JSON.stringify(optimizedProducts, null, 2), 'utf-8');
    console.log(`\x1b[32m✔ Re-ranked ${optimizedProducts.length} items to maximize commission yield.\x1b[0m`);

    // Rebuild static site with enriched reviews
    const contentGen = new ContentGenerator();
    const productsWithReviews = [];
    for (const p of optimizedProducts) {
      const review = await contentGen.generateSingaporeProductReview(p);
      productsWithReviews.push({ ...p, review });
    }
    const builder = new SiteBuilder();
    const buildResult = await builder.buildStaticSite(productsWithReviews);

    return {
      success: true,
      optimizedCount: optimizedProducts.length,
      topItem: optimizedProducts[0].title,
      topYield: optimizedProducts[0].expectedYieldPer100Clicks,
      distPath: buildResult.distPath
    };
  }

  /**
   * Weekly Performance Audit & Review
   */
  generateWeeklyReview() {
    const products = JSON.parse(fs.readFileSync(this.seedPath, 'utf-8'));
    const scored = this.calculateProfitMetrics(products);
    const actions = fs.existsSync(this.actionsPath) ? JSON.parse(fs.readFileSync(this.actionsPath, 'utf-8')) : [];

    const totalPotentialYield = scored.reduce((sum, p) => sum + p.expectedYieldPer100Clicks, 0);
    const topPerformer = scored.sort((a, b) => b.expectedYieldPer100Clicks - a.expectedYieldPer100Clicks)[0];
    const topConverter = scored.sort((a, b) => b.effectiveCv - a.effectiveCv)[0];

    return {
      reviewDate: new Date().toISOString(),
      catalogSize: products.length,
      projectedMonthlyCommissionSgd: +(totalPotentialYield * 4.2).toFixed(2),
      topPerformer: {
        title: topPerformer.title,
        asin: topPerformer.asin,
        yieldPer100Clicks: topPerformer.expectedYieldPer100Clicks
      },
      topCookieTrigger: {
        title: topConverter.title,
        asin: topConverter.asin,
        cvRate: `${(topConverter.effectiveCv * 100).toFixed(1)}%`
      },
      recommendedActionsCount: actions.length,
      approvedActionsCount: actions.filter(a => a.status === 'approved').length
    };
  }
}
