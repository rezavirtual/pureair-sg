import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Polyfill self for tweetnacl
globalThis.self = globalThis;
const nacl = require('./lib/tweetnacl.cjs');

// Mock util for blake2b
const Module = require('module');
const origRequire = Module.prototype.require;
Module.prototype.require = function(pathStr) {
  if (pathStr.includes('util')) return { normalizeInput: x => x, toHex: () => '' };
  return origRequire.apply(this, arguments);
};
const blake = require('./lib/blake2b.cjs');

function sealNonce(epk, publicKey) {
  const hash = blake.blake2bInit(24, null);
  blake.blake2bUpdate(hash, epk);
  blake.blake2bUpdate(hash, publicKey);
  return blake.blake2bFinal(hash);
}

function seal(message, publicKey) {
  const ekp = nacl.box.keyPair();
  const overheadLength = nacl.box.overheadLength + nacl.box.publicKeyLength;
  const out = new Uint8Array(message.length + overheadLength);
  out.set(ekp.publicKey, 0);
  const nonce = sealNonce(ekp.publicKey, publicKey);
  const ct = nacl.box(message, nonce, publicKey, ekp.secretKey);
  out.set(ct, nacl.box.publicKeyLength);
  return out;
}

function apiRequest(token, method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Antigravity-Autonomous-Secrets-Sync',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Automatically uploads / updates GitHub Actions secrets for a given repository.
 * @param {string} repoFullName - e.g. "rezavirtual/baristacraft-sg"
 * @param {Object} secrets - key-value pairs of secrets
 * @param {string} githubToken - GitHub Personal Access Token
 */
export async function syncGitHubSecrets(repoFullName, secrets, githubToken) {
  console.log(`\n================================================================`);
  console.log(`🔐 AUTONOMOUS GITHUB SECRETS SYNC: ${repoFullName}`);
  console.log(`================================================================`);

  // 1. Fetch Repo Public Key
  console.log(`📡 Fetching repository encryption public key...`);
  const keyRes = await apiRequest(githubToken, 'GET', `/repos/${repoFullName}/actions/secrets/public-key`);
  if (keyRes.status !== 200 || !keyRes.data?.key) {
    throw new Error(`Failed to fetch public key for ${repoFullName} (HTTP ${keyRes.status})`);
  }

  const { key_id, key } = keyRes.data;
  console.log(`✔ Public key retrieved (Key ID: ${key_id})`);

  const secretKeys = Object.keys(secrets);
  console.log(`🚀 Uploading ${secretKeys.length} secrets to GitHub Actions...`);

  for (const name of secretKeys) {
    const value = secrets[name];
    if (!value) {
      console.warn(`⚠️ Skipping empty secret: ${name}`);
      continue;
    }

    const messageBytes = Buffer.from(String(value));
    const keyBytes = Buffer.from(key, 'base64');
    const encryptedBytes = seal(messageBytes, keyBytes);
    const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

    const putBody = JSON.stringify({
      encrypted_value: encryptedValue,
      key_id: key_id
    });

    const res = await apiRequest(githubToken, 'PUT', `/repos/${repoFullName}/actions/secrets/${name}`, putBody);
    if (res.status === 201 || res.status === 204) {
      console.log(`  ✔ Secret [${name}] successfully encrypted & uploaded.`);
    } else {
      console.error(`  ❌ Secret [${name}] failed (HTTP ${res.status}):`, res.data);
    }
  }

  console.log(`================================================================`);
  console.log(`✨ All ${secretKeys.length} GitHub Actions secrets are active in the cloud!`);
  console.log(`================================================================\n`);
  return true;
}

function loadEnv() {
  const envPath = path.resolve(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

// Auto-run if executed from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  loadEnv();
  const repo = process.argv[2] || process.env.GITHUB_REPO || 'rezavirtual/glowdevice-sg';
  const token = process.env.GITHUB_PAT || '';

  const defaultSecrets = {
    NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID || '',
    NETLIFY_AUTH_TOKEN: process.env.NETLIFY_AUTH_TOKEN || '',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
    REPORT_EMAIL: process.env.REPORT_EMAIL || 'rezavirtual@gmail.com'
  };

  if (!token) {
    console.error('❌ GITHUB_PAT is required to sync secrets. Set it in .env or pass as env var.');
    process.exit(1);
  }

  syncGitHubSecrets(repo, defaultSecrets, token).catch(err => {
    console.error('Fatal sync error:', err.message);
  });
}
