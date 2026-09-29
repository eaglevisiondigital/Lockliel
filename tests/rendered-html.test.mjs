import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

// The Vinext worker/preview contract is retired. Check the actual Netlify export.
test('Next export contains the Lockliel homepage and resolvable build assets', async () => {
  const html = await readFile('out/index.html', 'utf8');
  assert.match(html, /<title>Lockliel/);
  assert.match(html, /<main[\s>]/);
  assert.match(html, /Reach[\s\S]*Teach[\s\S]*Train[\s\S]*Disciple/);
  const assets = [...html.matchAll(/(?:src|href)="(\/_next\/[^"?#]+)(?:[^" ]*)"/g)];
  assert(assets.length > 0, 'No Next.js assets were emitted');
  for (const [, asset] of assets) await access('out' + asset);
});

test('member and public entrypoints are statically exported', async () => {
  for (const page of ['my-lockliel/sign-in', 'my-lockliel/privacy', 'my-lockliel/admin', 'founders-50', 'a-heart-for-the-lost']) {
    const html = await readFile(`out/${page}.html`, 'utf8');
    assert.match(html, /<html/);
    assert.match(html, /<body/);
  }
});
