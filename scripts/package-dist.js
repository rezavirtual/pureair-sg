import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export function packageDistZip() {
  const scriptPath = path.join(ROOT, 'scripts', 'package-zip.ps1');
  console.log(`📦 Packaging dist/ into glowdevice-dist.zip with POSIX forward slashes...`);
  execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'inherit' });
  console.log(`✔ glowdevice-dist.zip is ready for Netlify Drop.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  packageDistZip();
}
