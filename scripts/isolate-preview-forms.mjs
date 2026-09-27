import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Netlify detects these attributes in exported HTML at deploy time. Previews
// must not register or update site-wide form definitions. Runtime POST blocking
// is separate and enforced at the edge, even for already registered form names.
export function isolateForms(html, deployContext) {
  if (deployContext === 'production') return html;
  return html.replace(/<form\b[^>]*>/gi, tag => tag.replace(
    /\s+(?:data-netlify|netlify)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?(?=\s|\/?>)/gi, '',
  ));
}

export async function isolateExport(directory, deployContext) {
  let changed = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) changed += await isolateExport(path, deployContext);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const before = await readFile(path, 'utf8');
      const after = isolateForms(before, deployContext);
      if (before !== after) { await writeFile(path, after); changed++; }
    }
  }
  return changed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const changed = await isolateExport('out', process.env.CONTEXT);
  console.log(`Form detection isolation: ${changed} exported HTML files updated.`);
}
