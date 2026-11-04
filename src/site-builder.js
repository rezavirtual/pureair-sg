import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CONFIG } from './config.js';

export class SiteBuilder {
  constructor(distDir = CONFIG.paths.dist) {
    this.distDir = distDir;
    this.productsDir = path.join(this.distDir, 'products');
    this.categoryDir = path.join(this.distDir, 'category');
    this.guidesDir = path.join(this.distDir, 'guides');
    this.dashboardDir = path.join(this.distDir, 'dashboard');
    this.assetsDir = path.join(this.distDir, 'assets');
    this.assetsProductsDir = path.join(this.assetsDir, 'products');
  }

  ensureDirectories() {
    [this.distDir, this.productsDir, this.categoryDir, this.guidesDir, this.dashboardDir, this.assetsDir, this.assetsProductsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async buildStaticSite(productsWithReviews) {
    console.log(`\x1b[34m[Site Builder]\x1b[0m Compiling PureAir SG static HTML pages for Netlify...`);
    this.ensureDirectories();

    // 1. Copy product photos from assets/products to dist/assets/products
    const srcAssets = path.join(CONFIG.paths.root, 'assets', 'products');
    if (fs.existsSync(srcAssets)) {
      const files = fs.readdirSync(srcAssets);
      files.forEach(f => {
        fs.copyFileSync(path.join(srcAssets, f), path.join(this.assetsProductsDir, f));
      });
    }

    // 2. Output Netlify configurations
    this.writeNetlifyConfigs();

    // 2.5. Output Management Dashboard (/dashboard/)
    const srcDashboard = path.join(CONFIG.paths.root, 'dashboard', 'index.html');
    if (fs.existsSync(srcDashboard)) {
      fs.copyFileSync(srcDashboard, path.join(this.dashboardDir, 'index.html'));
    }

    // 3. Output High-End Modern Stylesheet
    this.writeStylesheet();

    // 4. Generate Individual Product Review Pages
    for (const item of productsWithReviews) {
      const html = this.renderProductPage(item, productsWithReviews);
      fs.writeFileSync(path.join(this.productsDir, `${item.slug}.html`), html, 'utf-8');
    }

    // 5. Generate Category Pages
    const categories = [...new Set(productsWithReviews.map(p => p.categorySlug))];
    for (const catSlug of categories) {
      const catProducts = productsWithReviews.filter(p => p.categorySlug === catSlug);
      const html = this.renderCategoryPage(catSlug, catProducts, productsWithReviews);
      fs.writeFileSync(path.join(this.categoryDir, `${catSlug}.html`), html, 'utf-8');
    }

    // 5.5. Generate Singapore SEO Buyer Guides
    const guides = this.getSeoGuidesData(productsWithReviews);
    for (const guide of guides) {
      const html = this.renderGuidePage(guide, productsWithReviews);
      fs.writeFileSync(path.join(this.guidesDir, `${guide.slug}.html`), html, 'utf-8');
    }

    // 6. Generate Hub Index Page
    const indexHtml = this.renderIndexPage(productsWithReviews);
    fs.writeFileSync(path.join(this.distDir, 'index.html'), indexHtml, 'utf-8');

    // 7. Package POSIX zip archive & auto-deploy to Netlify
    await this.packageDistArchive();

    console.log(`\x1b[32m✔ PureAir SG site compiled: ${productsWithReviews.length} reviews + 3 SEO guides + hub index.\x1b[0m`);
    return {
      pagesCount: productsWithReviews.length + categories.length + guides.length + 1,
      distPath: this.distDir,
      zipPath: path.join(CONFIG.paths.root, 'glowdevice-dist.zip')
    };
  }

  async packageDistArchive() {
    try {
      const scriptPath = path.join(CONFIG.paths.root, 'scripts', 'package-zip.ps1');
      if (fs.existsSync(scriptPath)) {
        execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'ignore' });
        console.log(`\x1b[32m✔ Automated deploy package synced: glowdevice-dist.zip (POSIX forward slashes enforced)\x1b[0m`);

        if (process.env.NETLIFY_AUTH_TOKEN) {
          try {
            const { deployToNetlify } = await import('../scripts/deploy-to-netlify.js');
            await deployToNetlify();
          } catch (err) {
            console.warn(`[SiteBuilder] Auto-deploy notice: ${err.message}`);
          }
        }
      }
    } catch (e) {
      console.warn(`[SiteBuilder] Zip packaging notice: ${e.message}`);
    }
  }

  writeNetlifyConfigs() {
    const netlifyToml = `[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), camera=(), microphone=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/products"
  to = "/#productGrid"
  status = 301
`;
    fs.writeFileSync(path.join(this.distDir, 'netlify.toml'), netlifyToml, 'utf-8');

    const redirects = `# Netlify Static Multi-Page Redirects
/products    /#productGrid   301
`;
    fs.writeFileSync(path.join(this.distDir, '_redirects'), redirects, 'utf-8');
  }

  writeStylesheet() {
    const css = `
/* --------------------------------------------------------------------------
   ErgoDesk Singapore - Modern Workspace Design System
   Minimalist, High-Precision Ergonomics, Zero Clutter
   -------------------------------------------------------------------------- */

:root {
  --ergo-bg: #ffffff;
  --ergo-surface: #f8fafc;
  --ergo-card: #ffffff;
  --ergo-border: #e2e8f0;
  --ergo-border-light: #f1f5f9;
  --ergo-border-hover: #cbd5e1;
  --ergo-text-primary: #0f172a;
  --ergo-text-secondary: #475569;
  --ergo-text-tertiary: #94a3b8;
  --ergo-blue: #0284c7;
  --ergo-blue-hover: #0369a1;
  --ergo-blue-light: #0ea5e9;
  --ergo-accent: #0f172a;
  --ergo-green: #16a34a;
  --ergo-orange: #ea580c;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --ease-ergo: cubic-bezier(0.16, 1, 0.3, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--ergo-bg);
  color: var(--ergo-text-primary);
  font-family: var(--font-family);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

a { color: inherit; text-decoration: none; }

header.ergo-header {
  height: 56px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--ergo-border);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.ergo-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ergo-text-primary);
}

.brand-logo-icon {
  width: 24px;
  height: 24px;
  background: var(--ergo-blue);
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
}

.sg-badge {
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--ergo-surface);
  color: var(--ergo-text-secondary);
  padding: 3px 10px;
  border-radius: 980px;
  border: 1px solid var(--ergo-border);
}

.nav-menu {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  color: var(--ergo-text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--ergo-blue);
}

.hero-section {
  padding: 65px 0 40px;
  text-align: center;
  background: #ffffff;
}

.eyebrow-tag {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ergo-blue);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  margin-bottom: 16px;
  color: var(--ergo-text-primary);
}

.hero-subtitle {
  max-width: 720px;
  margin: 0 auto 30px;
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--ergo-text-secondary);
  line-height: 1.6;
}

.hero-cta-group {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-ergo-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ergo-blue);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 26px;
  border-radius: 980px;
  transition: all 0.2s var(--ease-ergo);
}

.btn-ergo-primary:hover {
  background: var(--ergo-blue-hover);
  transform: translateY(-1px);
}

.btn-ergo-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ergo-surface);
  color: var(--ergo-text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 26px;
  border-radius: 980px;
  border: 1px solid var(--ergo-border);
  transition: all 0.2s var(--ease-ergo);
}

.btn-ergo-secondary:hover {
  background: #edf2f7;
}

.filter-container {
  display: flex;
  justify-content: center;
  margin: 35px 0 40px;
}

.segmented-dock {
  display: inline-flex;
  background: var(--ergo-surface);
  border: 1px solid var(--ergo-border);
  padding: 4px;
  border-radius: 980px;
  gap: 4px;
  flex-wrap: wrap;
}

.segment-btn {
  background: transparent;
  border: none;
  color: var(--ergo-text-secondary);
  padding: 8px 20px;
  border-radius: 980px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn:hover { color: var(--ergo-text-primary); }

.segment-btn.active {
  background: #ffffff;
  color: var(--ergo-blue);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 28px;
  margin-bottom: 70px;
}

.ergo-card {
  background: var(--ergo-card);
  border: 1px solid var(--ergo-border);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s var(--ease-ergo), box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.ergo-card:hover {
  transform: translateY(-4px);
  border-color: var(--ergo-border-hover);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
}

.card-media-wrapper {
  position: relative;
  height: 270px;
  background: #ffffff;
  overflow: hidden;
  border-bottom: 1px solid var(--ergo-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-media-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 42px 18px 16px 18px;
  box-sizing: border-box;
  text-decoration: none;
}

.card-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: auto;
  display: block;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ergo-card:hover .card-img {
  transform: scale(1.05);
}

.card-brand-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #ffffff;
  border: 1px solid var(--ergo-border);
  color: var(--ergo-text-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 980px;
}

.card-tier-pill {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 980px;
  background: #ffffff;
  border: 1px solid var(--ergo-border);
}

.tier-anchor { color: var(--ergo-blue); border-color: rgba(2, 132, 199, 0.3); }
.tier-trigger { color: var(--ergo-green); border-color: rgba(22, 163, 74, 0.3); }

.card-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-cat {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ergo-blue);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 10px;
  color: var(--ergo-text-primary);
}

.card-desc {
  font-size: 0.88rem;
  color: var(--ergo-text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
  flex-grow: 1;
}

.card-features {
  list-style: none;
  margin-bottom: 18px;
}

.card-features li {
  font-size: 0.82rem;
  color: var(--ergo-text-secondary);
  margin-bottom: 5px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.card-features li::before {
  content: "✔";
  color: var(--ergo-green);
  font-size: 0.8rem;
  font-weight: 700;
}

.card-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid var(--ergo-border-light);
  margin-bottom: 16px;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-current {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ergo-text-primary);
}

.price-original {
  font-size: 0.82rem;
  color: var(--ergo-text-tertiary);
  text-decoration: line-through;
}

.rating-box {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ergo-text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-card-buy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--ergo-accent);
  color: #ffffff;
  padding: 11px 18px;
  border-radius: 980px;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-card-buy:hover {
  background: var(--ergo-blue);
}

/* Guides Section */
.guides-section {
  padding: 60px 0;
  border-top: 1px solid var(--ergo-border);
  background: var(--ergo-surface);
}

.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.guide-card {
  background: #ffffff;
  border: 1px solid var(--ergo-border);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s ease;
}

.guide-card:hover {
  transform: translateY(-3px);
  border-color: var(--ergo-border-hover);
}

.guide-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ergo-blue);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.guide-title {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 10px;
  color: var(--ergo-text-primary);
}

.guide-summary {
  font-size: 0.88rem;
  color: var(--ergo-text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
}

/* Footer */
footer.ergo-footer {
  background: #ffffff;
  border-top: 1px solid var(--ergo-border);
  padding: 40px 0 30px;
  font-size: 0.85rem;
  color: var(--ergo-text-secondary);
}

.legal-notice {
  background: var(--ergo-surface);
  border: 1px solid var(--ergo-border);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.82rem;
  line-height: 1.5;
}

/* Product Detail Page Layout */
.product-detail-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  padding: 40px 0 60px;
}

.detail-gallery {
  background: #ffffff;
  border: 1px solid var(--ergo-border);
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  box-sizing: border-box;
}

.detail-img {
  max-width: 100%;
  max-height: 420px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 0 auto;
  display: block;
}

.sticky-buy-box {
  background: #ffffff;
  border: 1px solid var(--ergo-border);
  border-radius: 18px;
  padding: 24px;
  position: sticky;
  top: 80px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.buy-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ergo-blue);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.buy-price-large {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ergo-text-primary);
  margin-bottom: 8px;
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 0.9rem;
}

.spec-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--ergo-border-light);
}

.spec-table td:first-child {
  font-weight: 600;
  color: var(--ergo-text-primary);
  width: 38%;
}

.spec-table td:last-child {
  color: var(--ergo-text-secondary);
}

/* Mobile Sticky Bar */
.mobile-sticky-cta {
  display: none;
}

@media (max-width: 860px) {
  .product-detail-layout { grid-template-columns: 1fr; }
  .hero-title { font-size: 2.2rem; }
  .product-grid { grid-template-columns: 1fr; }
  .card-media-wrapper {
    height: 240px;
  }
  .card-media-link {
    padding: 38px 14px 12px 14px;
  }
  .card-img {
    max-height: 185px;
  }
  .detail-gallery {
    padding: 20px 14px;
    min-height: 260px;
  }
  .detail-img {
    max-height: 280px;
  }
  .mobile-sticky-cta {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(15px);
    border-top: 1px solid var(--ergo-border);
    padding: 12px 18px;
    align-items: center;
    justify-content: space-between;
    z-index: 999;
  }
}

@media (max-width: 480px) {
  .card-media-wrapper {
    height: 220px;
  }
  .card-media-link {
    padding: 36px 10px 10px 10px;
  }
  .card-img {
    max-height: 170px;
  }
  .detail-gallery {
    min-height: 230px;
    padding: 16px 10px;
  }
  .detail-img {
    max-height: 230px;
  }
}
`;
    fs.writeFileSync(path.join(this.assetsDir, 'styles.css'), css, 'utf-8');
  }

  renderProductCard(p, isCategory = false) {
    const detailLink = isCategory ? `../products/${p.slug}.html` : `./products/${p.slug}.html`;
    const imgSrc = isCategory ? `../assets/products/${p.imageFile}` : `./assets/products/${p.imageFile}`;

    return `
    <div class="ergo-card" data-category="${p.categorySlug}">
      <div class="card-media-wrapper">
        <span class="card-brand-badge">${p.brand}</span>
        <span class="card-tier-pill ${p.isHighTicket ? 'tier-anchor' : 'tier-trigger'}">
          ${p.isHighTicket ? 'Premium Pick' : 'Popular Pick'}
        </span>
        <a href="${detailLink}" class="card-media-link">
          <img src="${imgSrc}" alt="${p.title}" class="card-img" loading="lazy" onerror="this.src='${p.officialImageUrl}'">
        </a>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <h3 class="card-title"><a href="${detailLink}">${p.title}</a></h3>
        <p class="card-desc">${p.rawDescription}</p>
        <ul class="card-features">
          ${p.features.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
        </ul>
        <div class="card-meta-bar">
          <div class="price-box">
            <span class="price-current">S$${p.priceSgd.toFixed(2)}</span>
            <span class="price-original">S$${p.originalPriceSgd.toFixed(2)}</span>
          </div>
          <div class="rating-box">
            ⭐ ${p.rating} <span style="color: var(--ergo-text-tertiary); font-weight: normal;">(${(p.reviewCount || p.reviewsCount || 100).toLocaleString()})</span>
          </div>
        </div>
        <a href="${p.affiliateUrl}" target="_blank" rel="nofollow noopener" class="btn-card-buy">
          Buy on Amazon.sg &rarr;
        </a>
      </div>
    </div>`;
  }

  renderIndexPage(products) {
    return `<!DOCTYPE html>
<html lang="en-SG">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PureAir SG - Best Smart Dehumidifiers, HEPA Air Purifiers & Mold Defense Singapore (2026)</title>
  <meta name="description" content="Singapore's premier clean air and tropical humidity defense authority. Independent reviews of compressor dehumidifiers, medical-grade H13 HEPA air purifiers, wardrobe moisture absorbers, and laser air quality monitors.">
  <link rel="stylesheet" href="./assets/styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PureAir SG",
    "url": "https://pureair-sg.netlify.app",
    "description": "Singapore's Premier Clean Air & Tropical Moisture Defense Authority",
    "inLanguage": "en-SG"
  }
  </script>
</head>
<body>
  <header class="ergo-header">
    <div class="container ergo-nav">
      <a href="./index.html" class="brand-mark">
        <div class="brand-logo-icon">💧</div>
        <span>PureAir SG</span>
        <span class="sg-badge">Singapore Smart Climate Authority</span>
      </a>
      <nav class="nav-menu">
        <a href="#productGrid" class="nav-link">Top Hardware</a>
        <a href="#guides" class="nav-link">Singapore Guides</a>
        <a href="./category/compressor-dehumidifiers.html" class="nav-link">Compressor Dehumidifiers</a>
        <a href="./category/hepa-air-purifiers.html" class="nav-link">HEPA Air Purifiers</a>
        <a href="./category/wardrobe-mold-defense.html" class="nav-link">Wardrobe Mold Defense</a>
        <a href="./category/air-monitors.html" class="nav-link">Air Monitors & Sensors</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero-section">
      <div class="container">
        <span class="eyebrow-tag">Singapore Tropical Climate & Mold Defense • 2026 Tested</span>
        <h1 class="hero-title">Total Mold Defense & Clean Air. Engineered for Singapore.</h1>
        <p class="hero-subtitle">
          Heavy-duty compressor dehumidifiers, H13 medical-grade HEPA purifiers, and wardrobe mold defense systems curated for Singapore 85%+ tropical humidity.
        </p>
        <div class="hero-cta-group">
          <a href="#productGrid" class="btn-ergo-primary">Browse Top Climate Tech &rarr;</a>
          <a href="#guides" class="btn-ergo-secondary">Read Singapore Buyer Guides</a>
        </div>
      </div>
    </section>

    <section class="container" id="productGrid">
      <div class="filter-container">
        <div class="segmented-dock">
          <button class="segment-btn active" onclick="filterCategory('all', this)">All Hardware (${products.length})</button>
          <button class="segment-btn" onclick="filterCategory('compressor-dehumidifiers', this)">Compressor Dehumidifiers</button>
          <button class="segment-btn" onclick="filterCategory('hepa-air-purifiers', this)">HEPA Air Purifiers</button>
          <button class="segment-btn" onclick="filterCategory('wardrobe-mold-defense', this)">Wardrobe Mold Defense</button>
          <button class="segment-btn" onclick="filterCategory('air-monitors', this)">Air Monitors & Sensors</button>
        </div>
      </div>

      <div class="product-grid">
        ${products.map(p => this.renderProductCard(p)).join('\n')}
      </div>
    </section>

    <!-- Singapore SEO Buyer Guides -->
    <section class="guides-section" id="guides">
      <div class="container">
        <span class="eyebrow-tag">Editorial Insights</span>
        <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; color: var(--ergo-text-primary);">
          Singapore Clean Air & Tropical Moisture Defense Guides
        </h2>
        <p style="color: var(--ergo-text-secondary); font-size: 1.05rem; margin-top: 6px;">
          Engineer-tested moisture extraction blueprints and HEPA air purification guides designed specifically for Singapore HDBs, condos, and tropical humidity.
        </p>
        <div class="guides-grid">
          ${this.getSeoGuidesData(products).map(g => `
            <div class="guide-card">
              <div class="guide-tag">Singapore Guide</div>
              <h3 class="guide-title"><a href="./guides/${g.slug}.html">${g.seoTitle}</a></h3>
              <p class="guide-summary">${g.summary}</p>
              <a href="./guides/${g.slug}.html" style="font-weight: 600; font-size: 0.9rem; color: var(--ergo-blue);">
                Read Full Blueprint &rarr;
              </a>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer class="ergo-footer">
    <div class="container">
      <div class="legal-notice">
        <strong>Affiliate & Fulfillment Notice:</strong> PureAir SG is an independent clean air and tropical climate research publication. All products featured are available directly on Amazon Singapore (Amazon.sg) with fast local Prime delivery and return coverage. As an Amazon Associate, PureAir SG earns from qualifying purchases.
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>Copyright &copy; ${new Date().getFullYear()} PureAir SG. All rights reserved.</div>
        <div>Singapore 230V / HDB Ergonomic Tested</div>
      </div>
    </div>
  </footer>

  <script>
    function filterCategory(cat, btn) {
      document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cards = document.querySelectorAll('.ergo-card');
      cards.forEach(c => {
        if (cat === 'all' || c.getAttribute('data-category') === cat) {
          c.style.display = 'flex';
        } else {
          c.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
  }

  renderProductPage(product, allProducts) {
    const related = allProducts.filter(p => p.categorySlug === product.categorySlug && p.asin !== product.asin).slice(0, 3);

    return `<!DOCTYPE html>
<html lang="en-SG">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.title} — Singapore Price & Ergonomic Review (2026)</title>
  <meta name="description" content="${product.rawDescription}">
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
  <header class="ergo-header">
    <div class="container ergo-nav">
      <a href="../index.html" class="brand-mark">
        <div class="brand-logo-icon">G</div>
        <span>PureAir SG</span>
      </a>
      <nav class="nav-menu">
        <a href="../index.html" class="nav-link">All Hardware</a>
        <a href="../category/${product.categorySlug}.html" class="nav-link">${product.category}</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="product-detail-layout">
      <div>
        <div class="detail-gallery">
          <img src="../assets/products/${product.imageFile}" alt="${product.title}" class="detail-img" onerror="this.src='${product.officialImageUrl}'">
        </div>

        <span class="eyebrow-tag">${product.brand} • ${product.category}</span>
        <h1 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; margin: 8px 0 16px; color: var(--ergo-text-primary);">
          ${product.title}
        </h1>
        <p style="font-size: 1.1rem; color: var(--ergo-text-secondary); line-height: 1.6; margin-bottom: 28px;">
          ${product.rawDescription}
        </p>

        <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 14px; color: var(--ergo-text-primary);">
          Key Clean Air & Climate Features
        </h3>
        <ul style="list-style: none; margin-bottom: 30px;">
          ${product.features.map(f => `
            <li style="font-size: 0.95rem; color: var(--ergo-text-secondary); margin-bottom: 8px; display: flex; gap: 8px;">
              <span style="color: var(--ergo-green); font-weight: 700;">✔</span>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>

        <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 14px; color: var(--ergo-text-primary);">
          Singapore Technical & Climate Specifications
        </h3>
        <table class="spec-table">
          <tbody>
            ${Object.entries(product.singaporeSpecs || {}).map(([key, val]) => `
              <tr>
                <td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                <td>${val}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <aside>
        <div class="sticky-buy-box">
          <div class="buy-eyebrow">Amazon Singapore Live Deal</div>
          <div class="buy-price-large">S$${product.priceSgd.toFixed(2)}</div>
          <div style="font-size: 0.88rem; color: var(--ergo-green); font-weight: 600; margin-bottom: 12px;">
            🇸🇬 Amazon Prime Next-Day Delivery
          </div>
          <p style="font-size: 0.82rem; color: var(--ergo-text-secondary); margin-bottom: 20px; line-height: 1.5;">
            Includes 9% Singapore GST. Fulfilled directly by Amazon.sg with 15-day return protection.
          </p>
          <a href="${product.affiliateUrl}" target="_blank" rel="nofollow noopener" class="btn-ergo-primary" style="width: 100%; justify-content: center; padding: 13px;">
            Check Deal on Amazon.sg &rarr;
          </a>
          <div style="margin-top: 14px; font-size: 0.72rem; color: var(--ergo-text-tertiary); text-align: center;">
            Official Amazon Associates localized tracking link.
          </div>
        </div>

        ${related.length > 0 ? `
          <div style="margin-top: 24px; background: var(--ergo-surface); border: 1px solid var(--ergo-border); border-radius: 16px; padding: 20px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 14px; color: var(--ergo-text-primary);">Compare Similar Hardware</h4>
            ${related.map(r => `
              <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--ergo-border-light);">
                <a href="./${r.slug}.html" style="font-weight: 600; font-size: 0.88rem; color: var(--ergo-text-primary); display: block;">${r.title}</a>
                <span style="color: var(--ergo-blue); font-size: 0.85rem; font-weight: 700;">S$${r.priceSgd.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </aside>
    </div>

    <div class="mobile-sticky-cta">
      <div>
        <span style="font-size: 1.25rem; font-weight: 800; color: var(--ergo-text-primary);">S$${product.priceSgd.toFixed(2)}</span>
        <div style="font-size: 0.72rem; color: var(--ergo-green); font-weight: 600;">🇸🇬 Prime Next-Day</div>
      </div>
      <a href="${product.affiliateUrl}" target="_blank" rel="nofollow noopener" class="btn-ergo-primary" style="padding: 10px 20px;">
        Buy on Amazon.sg &rarr;
      </a>
    </div>
  </main>

  <footer class="ergo-footer">
    <div class="container">
      <p style="text-align: center;">Copyright &copy; ${new Date().getFullYear()} PureAir SG. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
  }

  renderCategoryPage(categorySlug, catProducts, allProducts) {
    const catName = catProducts[0]?.category || 'Ergonomic Workspace Hardware';
    return `<!DOCTYPE html>
<html lang="en-SG">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${catName} Singapore — Best Ergonomics & Prices (2026)</title>
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
  <header class="ergo-header">
    <div class="container ergo-nav">
      <a href="../index.html" class="brand-mark">
        <div class="brand-logo-icon">G</div>
        <span>PureAir SG</span>
      </a>
      <nav class="nav-menu">
        <a href="../index.html" class="nav-link">All Hardware</a>
        <a href="../index.html#guides" class="nav-link">HDB Guides</a>
      </nav>
    </div>
  </header>

  <main class="container" style="padding: 50px 24px;">
    <h1 style="font-size: 2.4rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; color: var(--ergo-text-primary);">${catName}</h1>
    <p style="color: var(--ergo-text-secondary); font-size: 1.05rem; margin-bottom: 35px;">Tested for Singapore HDB bedroom study nooks and tropical heat. Verified Amazon.sg pricing.</p>
    <div class="product-grid">
      ${catProducts.map(p => this.renderProductCard(p, true)).join('\n')}
    </div>
  </main>

  <footer class="ergo-footer">
    <div class="container">
      <p style="text-align: center; color: var(--ergo-text-tertiary);">Copyright &copy; ${new Date().getFullYear()} PureAir SG. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
  }

    getSeoGuidesData(products) {
    return [
      {
        slug: 'compressor-vs-desiccant-dehumidifier-singapore-guide',
        seoTitle: 'Compressor vs Desiccant Dehumidifiers: Which is Best for Singapore HDB Flats? (2026)',
        summary: 'Singapore sits at 80% to 90% ambient relative humidity year-round. Discover why rotary compressor units outperform peltier and desiccant models for tropical mold eradication, energy consumption, and laundry drying.',
        heroProduct: products.find(p => p.asin === 'B0GSX4BP21') || products[0],
        content: `
          <p>Singapore's ambient relative humidity fluctuates between 75% and 95% across the year. In sealed HDB bedrooms and modern condominiums with concrete walls, this excessive moisture triggers rapid black mold (Aspergillus and Cladosporium) growth on walls, leather bags, and bedframes within weeks.</p>
          <p>While inexpensive semiconductor Peltier units struggle to collect even 300ml of water a day, rotary compressor dehumidifiers extract between 10 and 16 liters every 24 hours. They run on eco-friendly R290 refrigerant, consuming less than 220 watts while rapidly dropping indoor humidity from 85% down to a healthy 50% mold-inhibition threshold.</p>
          <h3>What to Look for in a Singapore Dehumidifier</h3>
          <ul>
            <li><strong>Continuous Drainage Port:</strong> Allows direct hose connection into toilet drains or floor traps, bypassing 2L-4L water tank emptying.</li>
            <li><strong>Digital Humidistat Auto-Off:</strong> Automatically shuts off the compressor once 50% relative humidity is reached, slashing electricity bills.</li>
            <li><strong>Active Carbon Pre-Filters:</strong> Traps musty indoor odors and pet dander while dehumidifying damp laundry indoors on rainy monsoon days.</li>
          </ul>
        `
      },
      {
        slug: 'singapore-haze-pm25-hepa-air-purifier-buying-guide',
        seoTitle: 'Singapore Haze & PM2.5 Defense: Medical-Grade H13 True HEPA Purifier Buying Guide (2026)',
        summary: 'How to safeguard your family from seasonal transboundary haze, road pollution, and volatile indoor VOCs. What CADR ratings and true HEPA filtration you actually need for Singapore master bedrooms.',
        heroProduct: products.find(p => p.asin === 'B08L73QL1V') || products[1],
        content: `
          <p>During the regional dry season, transboundary smoke haze can push Singapore's 24-hour PSI and PM2.5 concentrations into the unhealthy bracket without warning. Microscopic PM2.5 particles bypass the nasal lining and enter the bloodstream, aggravating asthma, sinus inflammation, and infant allergies.</p>
          <p>True medical-grade H13 HEPA filters capture 99.97% of airborne particulate matter down to 0.3 microns, including fine combustion smoke, dust mite allergens, and pollen spores. When paired with high Clean Air Delivery Rate (CADR) fans, they circulate and purify the entire volume of a typical 4-room HDB living area in under 15 minutes.</p>
          <h3>Key Features for Singapore HEPA Air Purifiers</h3>
          <ul>
            <li><strong>True H13 Certification:</strong> Avoid generic "HEPA-type" filters that leak particles larger than 2.5 microns.</li>
            <li><strong>Laser PM2.5 Air Quality Sensor:</strong> Real-time color-coded LED display and automated fan ramp-up when cooking fumes or haze spike.</li>
            <li><strong>Whisper-Quiet Sleep Mode (Sub-24dB):</strong> Essential for light sleepers in compact Singapore master bedrooms with air conditioning.</li>
          </ul>
        `
      },
      {
        slug: 'wardrobe-luxury-bag-mold-prevention-singapore',
        seoTitle: 'Preventing Mold on Leather Handbags & Wardrobes in Singapore: Permanent Solutions',
        summary: 'Why disposable silica gel packs and Thirsty Hippo tubs fail in Singapore humidity within 3 weeks. Comparing renewable mini dehumidifiers, dry-box hygrometers, and airtight sealing for luxury leather care.',
        heroProduct: products.find(p => p.asin === 'B0FVFCB9F6') || products[2],
        content: `
          <p>Every homeowner in Singapore has experienced the heartbreak of opening a built-in wardrobe to discover white powdery mildew fuzz coating leather Chanel, Herm�s, or Louis Vuitton bags and designer dress shoes.</p>
          <p>Disposable calcium chloride moisture absorbers quickly fill with caustic alkaline water, posing leakage risks that permanently stain exotic leathers. Compact rechargeable Peltier and renewable silica cartridges offer a non-toxic, spill-proof alternative that keeps wardrobe microclimates dry for years.</p>
          <h3>Best Practices for Tropical Luxury Wardrobe Defense</h3>
          <ul>
            <li><strong>Renewable Moisture Absorbers:</strong> Cordless heating plug desorbs moisture overnight, allowing 300+ reuse cycles.</li>
            <li><strong>Digital Wardrobe Hygrometers:</strong> Track interior wardrobe humidity to ensure it stays between 45% and 55% RH.</li>
            <li><strong>Periodic Airflow:</strong> Never seal damp items in airtight plastic bags; allow breathable dust covers and active moisture extraction.</li>
          </ul>
        `
      }
    ];
  }

  renderGuidePage(guide, allProducts) {
    return `<!DOCTYPE html>
<html lang="en-SG">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guide.seoTitle} — PureAir SG</title>
  <meta name="description" content="${guide.summary}">
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
  <header class="ergo-header">
    <div class="container ergo-nav">
      <a href="../index.html" class="brand-mark">
        <div class="brand-logo-icon">G</div>
        <span>PureAir SG</span>
      </a>
      <nav class="nav-menu">
        <a href="../index.html" class="nav-link">All Hardware</a>
        <a href="../index.html#guides" class="nav-link">All Guides</a>
      </nav>
    </div>
  </header>

  <main class="container" style="max-width: 860px; padding: 50px 24px;">
    <span class="eyebrow-tag">Singapore Clean Air & Climate Blueprint</span>
    <h1 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 20px; color: var(--ergo-text-primary);">
      ${guide.seoTitle}
    </h1>
    <div style="color: var(--ergo-text-secondary); font-size: 1.15rem; line-height: 1.6; margin-bottom: 30px;">
      ${guide.content}
    </div>

    ${guide.heroProduct ? `
      <div style="background: var(--ergo-surface); border: 1px solid var(--ergo-border); border-radius: 18px; padding: 28px; margin: 35px 0;">
        <span class="eyebrow-tag">Editor's Recommended Hardware</span>
        <h3 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 10px; color: var(--ergo-text-primary);">${guide.heroProduct.title}</h3>
        <p style="color: var(--ergo-text-secondary); font-size: 0.95rem; margin-bottom: 18px;">${guide.heroProduct.rawDescription}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <span style="font-size: 1.5rem; font-weight: 800; color: var(--ergo-text-primary);">S$${guide.heroProduct.priceSgd.toFixed(2)}</span>
          <a href="${guide.heroProduct.affiliateUrl}" target="_blank" rel="nofollow noopener" class="btn-ergo-primary">
            Check Amazon.sg Deal &rarr;
          </a>
        </div>
      </div>
    ` : ''}

    <a href="../index.html" style="font-weight: 600; color: var(--ergo-blue); display: inline-block; margin-top: 20px;">
      &larr; Back to PureAir SG Hub
    </a>
  </main>

  <footer class="ergo-footer">
    <div class="container">
      <p style="text-align: center; color: var(--ergo-text-tertiary);">Copyright &copy; ${new Date().getFullYear()} PureAir SG. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
  }
}
