import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function walk(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
const modules = walk('netlify').filter(path => /\.(?:mjs|js)$/.test(path));
for (const path of modules) execFileSync(process.execPath, ['--check', path]);
const handlers = modules.filter(path => /^netlify\/(?:edge-functions|functions)\//.test(path));
for (const path of handlers) await import(pathToFileURL(join(process.cwd(), path)).href);
console.log(`Validated ${modules.length} Netlify modules; imported ${handlers.length} handlers.`);
