import crypto from 'crypto';
import fs from 'fs';
import { CONFIG } from './config.js';

export class AmazonPAAPIClient {
  constructor(options = {}) {
    this.accessKey = options.accessKey || CONFIG.amazon.accessKey;
    this.secretKey = options.secretKey || CONFIG.amazon.secretKey;
    this.partnerTag = options.partnerTag || CONFIG.amazon.associateTag;
    this.host = options.host || CONFIG.amazon.host;
    this.region = options.region || CONFIG.amazon.region;
    this.marketplaceId = CONFIG.amazon.marketplaceId;
    this.seedPath = CONFIG.paths.productFeed;
  }

  localizeAffiliateLink(asin, customTag = null) {
    const tag = customTag || this.partnerTag;
    const cleanAsin = (asin || '').trim().toUpperCase();
    return `https://www.amazon.sg/dp/${cleanAsin}/?tag=${tag}&linkCode=ogi&th=1&psc=1`;
  }

  async fetchHighTicketPetTech(category = null) {
    return this.fetchProducts(category);
  }

  async fetchProducts(category = null) {
    console.log(`\x1b[36m[Amazon.sg Feed]\x1b[0m Reading verified ErgoDesk SG catalog from: ${this.seedPath}...`);
    if (!fs.existsSync(this.seedPath)) {
      throw new Error(`Product feed seed file not found at ${this.seedPath}`);
    }

    const rawData = fs.readFileSync(this.seedPath, 'utf-8');
    const items = JSON.parse(rawData);

    const filtered = category 
      ? items.filter(item => item.category.toLowerCase().includes(category.toLowerCase()) || item.categorySlug === category)
      : items;

    return filtered.map(item => ({
      ...item,
      affiliateUrl: this.localizeAffiliateLink(item.asin),
      commissionPerSaleSgd: +(item.priceSgd * item.commissionRate).toFixed(2),
      expectedYieldPer100Clicks: +(item.priceSgd * item.commissionRate * (item.effectiveCv || 0.05) * 100).toFixed(2)
    }));
  }
}
