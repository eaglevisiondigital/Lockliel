// Preload before test/application imports. No host allowlist, including loopback.
// Mocks may replace transports, but swallowed real calls still fail the process.
import { after } from 'node:test';
import { syncBuiltinESMExports } from 'node:module';
import http from 'node:http';
import https from 'node:https';
import http2 from 'node:http2';
import net from 'node:net';
import tls from 'node:tls';
import dgram from 'node:dgram';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';

const attempts = [];
function deny(transport) {
  return function blockedNetwork() {
    // Deliberately do not include URLs, headers, credentials or payloads.
    attempts.push(transport);
    process.exitCode = 1;
    throw new Error(`Unexpected network access blocked: ${transport}`);
  };
}

globalThis.fetch = deny('fetch');
if (globalThis.WebSocket) globalThis.WebSocket = deny('WebSocket');
for (const [name, target] of [['http', http], ['https', https]]) {
  target.request = deny(`${name}.request`);
  target.get = deny(`${name}.get`);
}
http2.connect = deny('http2.connect');
net.connect = deny('net.connect');
net.createConnection = deny('net.createConnection');
net.Socket.prototype.connect = deny('Socket.connect');
tls.connect = deny('tls.connect');
dgram.Socket.prototype.send = deny('dgram.send');
dgram.Socket.prototype.connect = deny('dgram.connect');
for (const target of [dns, dnsPromises, dns.Resolver.prototype, dnsPromises.Resolver.prototype]) {
  for (const name of Object.getOwnPropertyNames(target)) {
    if (/^(lookup|resolve|reverse)/.test(name) && typeof target[name] === 'function') {
      target[name] = deny(`dns.${name}`);
    }
  }
}
syncBuiltinESMExports();

after(() => {
  if (attempts.length) {
    throw new Error(`Forbidden network attempts (${attempts.length}): ${[...new Set(attempts)].join(', ')}`);
  }
});
