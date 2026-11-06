import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || 4860);
const isFile = path => stat(path).then(s => s.isFile()).catch(() => false);
const redirectSource = await readFile(resolve(root, '_redirects'), 'utf8').catch(() => '');
const redirects = new Map(redirectSource.trim().split('\n').filter(Boolean).map(line => {
  const [from, to, status] = line.trim().split(/\s+/);
  return [decodeURIComponent(from), { to, status: Number(status) }];
}));
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.md': 'text/markdown; charset=utf-8', '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};
const exactMime = {
  '/atom.xml': 'application/atom+xml; charset=utf-8',
  '/feed.xml': 'application/rss+xml; charset=utf-8',
  '/feed.json': 'application/feed+json; charset=utf-8',
};
const knownFiles = await readdir(root, { recursive: true, withFileTypes: true });
const filePaths = new Set(knownFiles.filter(file => file.isFile()).map(file => resolve(file.parentPath, file.name)));

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://local');
    const path = decodeURIComponent(url.pathname);
    const base = resolve(root, `.${path}`);
    if ((base !== root && !base.startsWith(`${root}${sep}`)) || ['/_headers', '/_redirects'].includes(path)) {
      res.writeHead(404).end();
      return;
    }
    const redirect = redirects.get(path);
    if (redirect) {
      res.writeHead(redirect.status, { Location: redirect.to + url.search }).end();
      return;
    }
    if (redirects.size && path !== '/404.html' && path.endsWith('.html') && filePaths.has(base)) {
      const location = path === '/index.html' ? '/' : url.pathname.slice(0, -5);
      res.writeHead(301, { Location: location + url.search }).end();
      return;
    }
    let chosen;
    for (const file of [base, `${base}.html`, resolve(base, 'index.html')]) {
      if (filePaths.has(file) && await isFile(file)) { chosen = file; break; }
    }
    if (!chosen) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile(resolve(root, '404.html')));
      return;
    }
    const type = exactMime[path] || mime[extname(chosen)] || 'application/octet-stream';
    const body = await readFile(chosen);
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store' };
    if (process.env.LOCAL_GZIP === '1' && /\bgzip\b/.test(req.headers['accept-encoding'] || '') && /^(?:text\/|application\/(?:\w+\+)?(?:json|xml))/.test(type)) {
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
      res.end(gzipSync(body));
      return;
    }
    res.writeHead(200, headers).end(body);
  } catch {
    if (!res.headersSent) res.writeHead(400);
    res.end('Bad request');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/ (${root})`));
