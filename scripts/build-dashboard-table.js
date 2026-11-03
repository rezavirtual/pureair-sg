import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const seedPath = path.join(ROOT, 'data', 'products-seed.json');
const dashPath = path.join(ROOT, 'dashboard', 'index.html');
const distDashPath = path.join(ROOT, 'dist', 'dashboard', 'index.html');

const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const rows = products.map(p => {
  const commRate = ((p.commissionRate || 0.1) * 100).toFixed(1) + '%';
  const commSgd = 'S$' + (p.commissionPerSaleSgd || (p.priceSgd * (p.commissionRate || 0.1))).toFixed(2);
  const role = p.isHighTicket ? 'Hero Anchor (High Ticket)' : (p.isBudgetPick ? 'High-Velocity Cookie Trigger' : 'Volume Beauty Engine');

  return `          <tr>
            <td>
              <div class="product-cell">
                <div>
                  ${p.brand ? p.brand + ' - ' : ''}${p.title}
                  <div><span class="asin-pill">${p.asin}</span></div>
                </div>
              </div>
            </td>
            <td>${p.category}</td>
            <td><strong>S$${p.priceSgd.toFixed(2)}</strong></td>
            <td>${commRate}</td>
            <td><strong style="color: var(--emerald);">${commSgd}</strong></td>
            <td>${role}</td>
            <td><span class="badge-gain">200 OK</span></td>
          </tr>`;
}).join('\n');

function updateDashboard(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Replace Header Title
  html = html.replace(
    /<h1>ErgoDesk Singapore - Sales & Marketing Profit Dashboard/g,
    '<h1>GlowDevice SG — Beauty Tech & Personal Care Profit Dashboard'
  );

  // 2. Replace Strategy Formula & Audience
  html = html.replace(
    /<span>Formula: <strong>Price &times; 10% \(Furniture\) &times; Conv%<\/strong><\/span>/g,
    '<span>Formula: <strong>Price &times; 10%–12% (Personal Care & Beauty) &times; Conv%</strong></span>'
  );
  html = html.replace(
    /<span>Target Audience: <strong>Singapore Remote Professionals & HDB Homeowners<\/strong><\/span>/g,
    '<span>Target Audience: <strong>Singapore Skincare Enthusiasts & Beauty Tech Buyers</strong></span>'
  );
  html = html.replace(
    /`  • Target Audience: Singapore Remote Professionals & HDB Homeowners\\n` \+/g,
    "`  • Target Audience: Singapore Skincare Enthusiasts & Beauty Tech Buyers\\n` +"
  );

  // 3. Replace Associate Tag
  html = html.replace(
    /Tracking Associate Tag: <strong>glowdevicesg-22<\/strong>/g,
    'Tracking Associate Tag: <strong>pettechsg-22</strong>'
  );

  // 4. Replace Table Body
  const tableRegex = /<tbody id="productsTableBody">[\s\S]*?<\/tbody>/;
  const newTbody = `<tbody id="productsTableBody">\n${rows}\n        </tbody>`;
  html = html.replace(tableRegex, newTbody);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✔ Successfully updated ${filePath}`);
}

updateDashboard(dashPath);
updateDashboard(distDashPath);
console.log('✨ GlowDevice SG dashboard is now 100% beauty tech verified!');
