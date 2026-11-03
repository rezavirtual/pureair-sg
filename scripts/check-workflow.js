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
  path: '/repos/rezavirtual/glowdevice-sg/actions/runs?per_page=3',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'GlowDevice-Dispatcher',
    'Accept': 'application/vnd.github+json'
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    if (data.workflow_runs && data.workflow_runs.length > 0) {
      for (const run of data.workflow_runs) {
        console.log(`Run #${run.run_number} (${run.name}): Status = ${run.status}, Conclusion = ${run.conclusion}, URL = ${run.html_url}`);
      }
    } else {
      console.log('No runs found yet or waiting for queueing.');
    }
  });
});
req.end();
