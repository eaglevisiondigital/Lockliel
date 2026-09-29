import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { withProductionBackend } from '../netlify/lib/deployment-safety.mjs';
import edge, { config } from '../netlify/edge-functions/preview-isolation.js';
import referral from '../netlify/functions/lockliel-referral-redirect.mjs';
import { isolateExport, isolateForms } from '../scripts/isolate-preview-forms.mjs';

const production = { deploy: { context: 'production' } };
const blockedContexts = [undefined, {}, { deploy: {} }, ...[
  'deploy-preview', 'branch-deploy', 'dev', 'test', 'staging', '', 'Production',
].map(context => ({ deploy: { context } }))];
const methods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
async function assertBlocked(response) {
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'production_backend_disabled');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('location'), null);
}

// Invoke EVERY deployed entrypoint, not only a helper. No mocks are installed:
// the suite's preload makes any accidental transport call fail the process.
const functions = await readdir(new URL('../netlify/functions/', import.meta.url));
for (const name of functions.filter(name => name.endsWith('.mjs'))) {
  test(`${name}: nonproduction contexts stop before any backend access`, async () => {
    const { default: handler } = await import(`../netlify/functions/${name}`);
    for (const context of blockedContexts) {
      for (const method of methods) {
        const request = new Request(`https://lockliel.com/.netlify/functions/${name.slice(0, -4)}?code=abcdef`, {
          method, headers: { Origin: 'https://lockliel.com', 'X-Netlify-Context': 'production' },
        });
        await assertBlocked(await handler(request, context));
        assert.equal(request.bodyUsed, false);
      }
    }
  });
}

test('production forwards the original request, context and response without changing authorization', async () => {
  const request = new Request('https://lockliel.com/api/example', { method: 'POST', body: 'original' });
  const response = new Response('approved', { status: 201, headers: { 'Set-Cookie': 'example=value' } });
  const handler = withProductionBackend((r, c) => {
    assert.equal(r, request); assert.equal(c, production); return response;
  });
  assert.equal(await handler(request, production), response);
  const { default: protectedHandler } = await import('../netlify/functions/lockliel-admin-privacy.mjs');
  assert.equal((await protectedHandler(new Request('https://lockliel.com/api/lockliel/admin/privacy'), production)).status, 401);
});

test('production referral GET preserves its intended tracking write through a mock', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, init });
    return Response.json({ destination: '/founders-50' });
  });
  const request = new Request('https://lockliel.com/.netlify/functions/lockliel-referral-redirect?code=abcdef');
  const response = await referral(request, production);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/founders-50?ref=abcdef');
  assert.equal(calls.length, 1);
  assert.equal(new URL(calls[0].url).pathname, '/functions/v1/track-referral');
  assert.equal(calls[0].init.method, 'POST');
  await assertBlocked(await referral(request, { deploy: { context: 'deploy-preview' } }));
  assert.equal(calls.length, 1);
});

test('request headers, origin and process environment cannot authorize the backend', async () => {
  const before = { CONTEXT: process.env.CONTEXT, NODE_ENV: process.env.NODE_ENV };
  process.env.CONTEXT = 'production';
  process.env.NODE_ENV = 'production';
  const guarded = withProductionBackend(() => { throw Error('Must not execute'); });
  try {
    await assertBlocked(await guarded(new Request('https://lockliel.com/api/example', {
      headers: { 'X-Netlify-Context': 'production', Origin: 'https://lockliel.com' },
    })));
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('edge guard blocks native Forms submissions at any path and preserves production', async () => {
  assert.deepEqual(config, { path: '/*', onError: 'fail' });
  for (const path of ['/', '/thank-you', '/founders-50/thank-you', '/__faith-boost-book.html', '/__heart-book-release.html', '/__founders50.html', '/anything.css']) {
    for (const context of blockedContexts) {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
        const request = new Request('https://preview.example.invalid' + path, { method });
        await assertBlocked(edge(request, context));
        assert.equal(edge(request, production), undefined);
      }
    }
  }
});

test('edge guard covers custom API paths, direct function URLs, referral GETs and protected reader', async () => {
  const paths = ['/r/abcdef', '/r', '/api', '/%61pi/lockliel-auth/session', '/who-god-says-you-are/reader/chapter.pdf'];
  for (const name of functions.filter(name => name.endsWith('.mjs'))) {
    const { config: route } = await import(`../netlify/functions/${name}`);
    paths.push('/.netlify/functions/' + name.slice(0, -4));
    for (const path of [route.path].flat().filter(Boolean)) paths.push(path.replace('*', 'example'));
  }
  for (const path of paths) {
    for (const method of ['GET', 'HEAD']) {
      const request = new Request('https://preview.example.invalid' + path, { method });
      await assertBlocked(edge(request, { deploy: { context: 'deploy-preview' } }));
      assert.equal(edge(request, production), undefined);
    }
  }
});

test('preview and local static pages/assets pass through without changing their content', () => {
  for (const context of blockedContexts) {
    for (const path of ['/', '/founders-50', '/my-lockliel/sign-in', '/who-god-says-you-are/read', '/_next/static/chunk.js', '/logo.svg']) {
      for (const method of ['GET', 'HEAD']) assert.equal(edge(new Request('https://localhost' + path, { method }), context), undefined);
    }
  }
});

test('form detection attributes are removed only outside explicit production', async () => {
  const html = '<form data-netlify="true" name="one" data-netlify-honeypot="bot-field"><input name="email"></form>' +
    "<FORM netlify name='two'></FORM><form netlify='true' name='three'></form><form data-netlify=true name=four></form>";
  assert.equal(isolateForms(html, 'production'), html);
  for (const context of [undefined, 'deploy-preview', 'branch-deploy', 'dev', 'unknown', '']) {
    const safe = isolateForms(html, context);
    assert.doesNotMatch(safe, /\s(?:data-netlify|netlify)(?:\s|=|>)/i);
    assert.match(safe, /data-netlify-honeypot="bot-field"/);
    assert.match(safe, /<input name="email">/);
  }
  const directory = await mkdtemp(join(tmpdir(), 'lockliel-form-isolation-'));
  try {
    await mkdir(join(directory, 'nested'));
    await writeFile(join(directory, 'nested', 'form.html'), html);
    await writeFile(join(directory, 'asset.txt'), html);
    assert.equal(await isolateExport(directory, 'production'), 0);
    assert.equal(await readFile(join(directory, 'nested', 'form.html'), 'utf8'), html);
    assert.equal(await isolateExport(directory, undefined), 1);
    assert.equal(await readFile(join(directory, 'nested', 'form.html'), 'utf8'), isolateForms(html));
    assert.equal(await readFile(join(directory, 'asset.txt'), 'utf8'), html);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('actual export keeps form fields but cannot register production forms in a preview build', async () => {
  for (const path of ['index.html', 'founders-50.html', '__founders50.html', '__faith-boost-book.html', '__heart-book-release.html']) {
    const html = await readFile('out/' + path, 'utf8');
    const forms = html.match(/<form\b[^>]*>/gi);
    assert.ok(forms?.length, path);
    for (const form of forms) {
      if (process.env.CONTEXT === 'production') assert.match(form, /data-netlify="true"/);
      else assert.doesNotMatch(form, /\s(?:data-netlify|netlify)(?:\s|=|>)/i);
    }
  }
});
