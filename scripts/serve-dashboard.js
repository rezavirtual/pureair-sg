import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3333;
const DASHBOARD_FILE = path.join(process.cwd(), 'dashboard', 'index.html');
const STRATEGY_FILE = path.join(process.cwd(), 'data', 'approved-actions.json');

const server = http.createServer((req, res) => {
  // API endpoint to save approved strategy decisions
  if (req.method === 'POST' && req.url === '/api/apply-strategy') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        fs.writeFileSync(STRATEGY_FILE, JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, saved: data }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (fs.existsSync(DASHBOARD_FILE)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(DASHBOARD_FILE).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Dashboard file not found at dashboard/index.html');
  }
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🪑 GlowDevice SG Sales & Marketing Dashboard Server`);
  console.log(`👉 Live at: http://localhost:${PORT}`);
  console.log(`================================================================`);
});
