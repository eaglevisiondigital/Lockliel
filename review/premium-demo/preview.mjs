import { createServer } from 'node:http';
import { readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'integrity.json'), 'utf8'));
const files = new Map();
for (const [relative, expected] of Object.entries(manifest.files)) {
  if (!/^(?:index\.html|app\.js|styles\.css|assets\/[a-zA-Z0-9_.-]+)$/.test(relative)) throw new Error('Unapproved preview file.');
  const path = resolve(root, relative);
  if (realpathSync(path) !== path) throw new Error('Symbolic preview files are not allowed.');
  const bytes = readFileSync(path);
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('Preview integrity mismatch.');
  files.set('/' + relative, bytes);
}
const csp = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; object-src 'none'";
const contentType = path => path.endsWith('.html') ? 'text/html; charset=utf-8' : path.endsWith('.js') ? 'text/javascript; charset=utf-8' : path.endsWith('.css') ? 'text/css; charset=utf-8' : path.endsWith('.jpg') ? 'image/jpeg' : path.endsWith('.ttf') ? 'font/ttf' : 'text/plain; charset=utf-8';
const server = createServer((request, response) => {
  const expectedHost = `127.0.0.1:${server.address().port}`;
  const path = request.url === '/' ? '/index.html' : request.url;
  if (request.method !== 'GET' || request.headers.host !== expectedHost || !files.has(path)) {
    response.writeHead(404, {'Content-Type':'text/plain','Cache-Control':'no-store'}); response.end('Not available.'); return;
  }
  response.writeHead(200, {'Content-Type':contentType(path), 'Content-Security-Policy':csp, 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-store', 'Referrer-Policy':'no-referrer', 'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()', 'Cross-Origin-Resource-Policy':'same-origin'});
  response.end(files.get(path));
});
server.listen(0, '127.0.0.1', () => {
  console.log('Local Lockliel design proposals. No hosted services or stored data.');
  console.log(`Open http://127.0.0.1:${server.address().port}`);
  console.log('Press Control-C to stop.');
});
for (const signal of ['SIGINT','SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
