import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const guard = fileURLToPath(new URL('./support/network-guard.mjs', import.meta.url));
function run(source) {
  return spawnSync(process.execPath, ['--import', guard, '--input-type=module', '-e', source], {
    encoding: 'utf8', timeout: 10000,
    env: {PATH: process.env.PATH, NODE_ENV: 'test'},
  });
}

const probes = {
  fetch: "await fetch('https://example.invalid')",
  http: "(await import('node:http')).get('http://example.invalid')",
  https: "(await import('node:https')).request('https://example.invalid')",
  http2: "(await import('node:http2')).connect('https://example.invalid')",
  tcp: "(await import('node:net')).connect(443, '127.0.0.1')",
  socket: "new (await import('node:net')).Socket().connect(443, '127.0.0.1')",
  tls: "(await import('node:tls')).connect(443, 'example.invalid')",
  udp: "(await import('node:dgram')).createSocket('udp4').send('x', 53, '127.0.0.1')",
  dns: "await (await import('node:dns/promises')).lookup('example.invalid')",
  resolver: "await new (await import('node:dns/promises')).Resolver().resolve4('example.invalid')",
  websocket: "new WebSocket('wss://example.invalid')",
};
for (const [name, source] of Object.entries(probes)) {
  test(`network guard fails even when ${name} errors are swallowed`, () => {
    const result = run(`try { ${source}; } catch {} `);
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /Forbidden network attempts/);
    assert.doesNotMatch(result.stdout + result.stderr, /example\.invalid/);
  });
}

test('explicit fake transport passes without network', () => {
  const result = run("globalThis.fetch = async () => new Response('fixture'); if (await (await fetch('https://example.invalid')).text() !== 'fixture') throw Error('bad mock');");
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('the original unmocked CRM path cannot silently pass', () => {
  const result = run(`
    const {createReleaseSignup} = await import('./netlify/functions/book-release.mjs');
    const rows = new Map();
    const store = {
      async setJSON(k,v) { rows.set(k,v); return {modified:true}; },
      async get(k) { return rows.get(k); },
      async getWithMetadata() { return null; }
    };
    const handler = createReleaseSignup({storeFor:()=>store,post:async()=>new Response(null,{status:204})});
    await handler(new Request('https://lockliel.com/api/book-release', {
      method:'POST', headers:{Origin:'https://lockliel.com','Content-Type':'application/json'},
      body:JSON.stringify({firstName:'Fixture',email:'fixture@example.invalid',releaseConsent:true})
    }));
  `);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /Forbidden network attempts/);
});
