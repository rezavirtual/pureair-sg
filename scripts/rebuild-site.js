import fs from 'fs';
import path from 'path';
import { SiteBuilder } from '../src/site-builder.js';

const products = JSON.parse(fs.readFileSync('./data/products-seed.json', 'utf-8'));
const siteBuilder = new SiteBuilder();
await siteBuilder.buildStaticSite(products);
console.log('PureAir SG recompiled successfully with uncropped images and updated dashboard!');
