import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

let rawSiteId = (process.env.NETLIFY_SITE_ID || '').trim().replace(/['"]/g, '');
const CANONICAL_SITES = {
  'glowdevice-sg': 'd470c7b1-d8e6-4f29-b939-38facd517897',
  'glowdevice-sg.netlify.app': 'd470c7b1-d8e6-4f29-b939-38facd517897',
  'https://glowdevice-sg.netlify.app': 'd470c7b1-d8e6-4f29-b939-38facd517897',
  'ergodesk-sg': '83fd2f83-4125-4ce7-abce-c5d9ef89320d',
  'ergodesk-sg.netlify.app': '83fd2f83-4125-4ce7-abce-c5d9ef89320d',
  'pettech-sg': 'd2f7947d-39e9-480a-b2c6-0e64e85ca96e',
  'pettech-sg.netlify.app': 'd2f7947d-39e9-480a-b2c6-0e64e85ca96e'
};

if (CANONICAL_SITES[rawSiteId]) {
  rawSiteId = CANONICAL_SITES[rawSiteId];
}

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawSiteId)) {
  rawSiteId = 'd470c7b1-d8e6-4f29-b939-38facd517897';
}

const SITE_ID = rawSiteId;

export async function deployToNetlify(zipFilePath = path.join(ROOT, 'glowdevice-dist.zip')) {
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!token) {
    console.log(`ℹ️ NETLIFY_AUTH_TOKEN is not configured in .env.`);
    return false;
  }

  if (!fs.existsSync(zipFilePath)) {
    console.log(`📦 Deploy archive not found at ${zipFilePath}. Auto-packaging dist/...`);
    const distDir = path.join(ROOT, 'dist');
    if (!fs.existsSync(distDir)) {
      console.error(`✖ dist/ directory not found.`);
      return false;
    }
    try {
      if (process.platform === 'win32') {
        const psScript = path.join(ROOT, 'scripts', 'package-zip.ps1');
        execSync(`powershell -ExecutionPolicy Bypass -File "${psScript}"`, { stdio: 'inherit' });
      } else {
        execSync(`cd "${distDir}" && zip -r "${zipFilePath}" .`, { stdio: 'inherit' });
      }
    } catch (e) {
      console.error(`✖ Auto-packaging failed:`, e.message);
      return false;
    }
  }

  console.log(`🚀 Deploying ${path.basename(zipFilePath)} directly to GlowDevice SG Netlify production (${SITE_ID})...`);
  const fileBuffer = fs.readFileSync(zipFilePath);

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${SITE_ID}/deploys`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${token}`,
        'Content-Length': fileBuffer.length
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(responseBody);
            console.log(`✔ Atomic Deploy Successful!`);
            console.log(`  • Deploy ID:   ${data.id}`);
            console.log(`  • Live URL:    https://glowdevice-sg.netlify.app/`);
            console.log(`  • State:       ${data.state}`);
            resolve(data);
          } catch (e) {
            console.log(`✔ Deploy accepted (HTTP ${res.statusCode})`);
            resolve(true);
          }
        } else {
          console.error(`✖ Netlify deploy failed (HTTP ${res.statusCode}):`, responseBody);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`✖ Netlify deploy network error:`, err.message);
      resolve(false);
    });

    req.write(fileBuffer);
    req.end();
  });
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  deployToNetlify();
}
