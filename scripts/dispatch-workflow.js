import https from 'https';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
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

loadEnv();

const token = process.env.GITHUB_PAT;
const req = https.request({
  hostname: 'api.github.com',
  path: '/repos/rezavirtual/glowdevice-sg/actions/workflows/weekly-audit.yml/dispatches',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'GlowDevice-Dispatcher',
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  }
}, res => {
  console.log('Dispatch HTTP response code:', res.statusCode);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    if (res.statusCode === 204) {
      console.log('✔ Workflow successfully triggered in the cloud!');
    } else {
      console.log('Response:', body);
    }
  });
});

req.write(JSON.stringify({ ref: 'main' }));
req.end();
