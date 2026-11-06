import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const blog = resolve(process.env.BLOG_ROOT || resolve(root, '../zxjlm.github.io'));
const revision = process.argv[2];
if (!revision || process.argv.length !== 3) throw new Error('Usage: pnpm sync <git-revision>');
const git = (...args) => execFileSync('git', ['-C', blog, ...args], { maxBuffer: 32 * 1024 * 1024 });
const commit = git('rev-parse', '--verify', '--end-of-options', `${revision}^{commit}`).toString().trim();
const manifestPath = resolve(root, 'validation/source-snapshot.json');

function destination(path) {
  if (path === 'pages/about/index.md') return 'src/content/about.md';
  if (path.startsWith('pages/posts/') && path.endsWith('.md')) return path.replace(/^pages\//, 'src/content/');
  if (path.startsWith('public/albums/') || path.startsWith('public/images/')) return path;
}

function owns(path) {
  return path === 'src/content/about.md'
    || (path.startsWith('src/content/posts/') && path.endsWith('.md'))
    || path.startsWith('public/albums/')
    || path.startsWith('public/images/');
}

function safeRelative(path) {
  return path.split('/').every(segment => segment && segment !== '.' && segment !== '..' && !segment.includes('\\'));
}

const previous = JSON.parse(await readFile(manifestPath, 'utf8'));
const next = new Map();
const foldedPaths = new Set();
const entries = git('ls-tree', '-rz', commit, '--', 'pages/about/index.md', 'pages/posts', 'public/albums', 'public/images');
for (const entry of entries.toString().split('\0').filter(Boolean)) {
  const tab = entry.indexOf('\t');
  const [mode, type, oid] = entry.slice(0, tab).split(' ');
  const source = entry.slice(tab + 1);
  const path = destination(source);
  if (!path) continue;
  if (type !== 'blob' || !['100644', '100755'].includes(mode) || !safeRelative(path)) {
    throw new Error(`Expected a regular snapshot file: ${source}`);
  }
  const folded = path.normalize('NFC').toLowerCase();
  if (foldedPaths.has(folded)) throw new Error(`Conflicting snapshot path: ${path}`);
  foldedPaths.add(folded);
  const bytes = git('cat-file', 'blob', oid);
  next.set(path, { bytes, sha256: createHash('sha256').update(bytes).digest('hex') });
}
if (!next.has('src/content/about.md') || !next.has('public/albums/index.json')) {
  throw new Error(`Missing required content in ${commit}`);
}

const deleted = previous.files.map(({ path }) => path).filter(path => !next.has(path));
for (const path of deleted) {
  if (!owns(path) || !safeRelative(path)) throw new Error(`Invalid managed snapshot path: ${path}`);
}

// Remove prior managed paths before writing, including case-only renames.
for (const path of deleted) {
  await rm(resolve(root, path), { force: true });
  console.log(`D ${path}`);
}
let changed = 0;
for (const [path, { bytes }] of next) {
  const absolute = resolve(root, path);
  const old = await readFile(absolute).catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (old?.equals(bytes)) continue;
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  console.log(`${old ? 'M' : 'A'} ${path}`);
  changed++;
}
const files = [...next].map(([path, { sha256 }]) => ({ path, sha256 }));
await writeFile(manifestPath, JSON.stringify({ commit, files }, null, 2) + '\n');
console.log(`${commit}: ${files.length} files, ${changed} written, ${deleted.length} removed.`);
