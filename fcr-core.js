/* Family Cyber Ready — shared core (envelope format, signatures, update ops).
 * Envelope:  FCR1.<T>.<payload>.<sig>
 *   T       = P (full plan) | U (update ops) | K (key rotation)
 *   payload = base64url(deflate-raw(JSON))
 *   sig     = base64url(ECDSA P-256 / SHA-256, raw 64-byte r||s) over ASCII "FCR1.<T>.<payload>"
 */
(function (g) {
  'use strict';
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const ALG = { name: 'ECDSA', namedCurve: 'P-256' };
  const SIG = { name: 'ECDSA', hash: 'SHA-256' };
  const MAX_COMPRESSED = 200 * 1024;      // reject oversized input
  const MAX_INFLATED = 2 * 1024 * 1024;   // guard against decompression bombs
  const ENVELOPE_RE = /FCR1\.([PUK])\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{86})/g;

  function b64u(bytes) {
    const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let s = '';
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64u(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function readCapped(stream, cap) {
    const reader = stream.getReader();
    const chunks = []; let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > cap) { try { reader.cancel(); } catch (e) {} throw new Error('Content too large'); }
      chunks.push(value);
    }
    const out = new Uint8Array(total); let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.length; }
    return out;
  }
  const deflate = (bytes) => readCapped(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw')), MAX_INFLATED);
  const inflate = (bytes) => readCapped(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')), MAX_INFLATED);

  async function sha256(bytes) { return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)); }
  async function fingerprint(pkB64) {
    const h = await sha256(unb64u(pkB64));
    return Array.from(h.slice(0, 8)).map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase().match(/.{4}/g).join('-');
  }
  async function keyId(pkB64) { return b64u((await sha256(unb64u(pkB64))).slice(0, 4)); }
  async function importPublic(pkB64) { return crypto.subtle.importKey('raw', unb64u(pkB64), ALG, false, ['verify']); }

  /** Find every envelope in arbitrary text (SMS body, email, file). Whitespace is stripped first
   *  because mail clients and SMS apps wrap long strings. Returned in input order. */
  function extract(text) {
    const flat = String(text || '').replace(/\s+/g, '');
    const found = []; let m;
    ENVELOPE_RE.lastIndex = 0;
    while ((m = ENVELOPE_RE.exec(flat))) found.push({ type: m[1], payload: m[2], sig: m[3], head: `FCR1.${m[1]}.${m[2]}`, raw: m[0] });
    return found;
  }

  /** Decode payload WITHOUT trusting it (used to read pk for first enrolment). */
  async function decodePayload(env) {
    if (env.payload.length > MAX_COMPRESSED * 1.4) throw new Error('Message too large');
    const json = dec.decode(await inflate(unb64u(env.payload)));
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== 'object' || obj.v !== 1) throw new Error('Unsupported message version');
    return obj;
  }
  async function verify(env, pkB64) {
    const key = await importPublic(pkB64);
    return crypto.subtle.verify(SIG, key, unb64u(env.sig), enc.encode(env.head));
  }

  // ---------- signing (coordinator) ----------
  async function generateKeyPair() {
    const kp = await crypto.subtle.generateKey(ALG, true, ['sign', 'verify']);
    const pk = b64u(await crypto.subtle.exportKey('raw', kp.publicKey));
    const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    return { pk, jwk };
  }
  async function importPrivate(jwk) {
    return crypto.subtle.importKey('jwk', jwk, ALG, false, ['sign']);
  }
  async function sign(type, payloadObj, privateKey) {
    const p = b64u(await deflate(enc.encode(JSON.stringify(payloadObj))));
    const head = `FCR1.${type}.${p}`;
    const sig = await crypto.subtle.sign(SIG, privateKey, enc.encode(head));
    return `${head}.${b64u(sig)}`;
  }
  // Passphrase protection for the coordinator's private key (PBKDF2-SHA256 -> AES-256-GCM)
  const PBKDF2_ITER = 310000;
  async function deriveAes(pass, salt) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function sealKey(jwk, pk, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await deriveAes(pass, salt);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify(jwk)));
    return { fcrKey: 1, pk, salt: b64u(salt), iv: b64u(iv), it: PBKDF2_ITER, ct: b64u(ct) };
  }
  async function unsealKey(sealed, pass) {
    const k = await deriveAes(pass, unb64u(sealed.salt));
    let pt;
    try { pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64u(sealed.iv) }, k, unb64u(sealed.ct)); }
    catch (e) { throw new Error('Wrong passphrase'); }
    return importPrivate(JSON.parse(dec.decode(pt)));
  }

  // ---------- update operations ----------
  // ["s", path, value]  set a value (path segments separated by "/"; array members addressed by id)
  // ["d", path]         delete
  // ["a", path, item]   add or replace an item (by item.id) in the array at path
  // ["n", level, text]  broadcast notice (level: info | warn | urgent)
  const BAD = new Set(['__proto__', 'prototype', 'constructor']);
  function segs(path) {
    const s = String(path).split('/').filter(Boolean);
    if (!s.length || s.some((x) => BAD.has(x))) throw new Error('Invalid path: ' + path);
    return s;
  }
  function step(cur, seg) {
    if (Array.isArray(cur)) return cur.find((x) => x && x.id === seg);
    return cur != null && Object.prototype.hasOwnProperty.call(cur, seg) ? cur[seg] : undefined;
  }
  function walk(root, s) {
    let cur = root;
    for (const seg of s) { cur = step(cur, seg); if (cur === undefined) throw new Error('Not found: ' + s.join('/')); }
    return cur;
  }
  function applyOps(plan, ops, meta) {
    const p = JSON.parse(JSON.stringify(plan));
    const changes = [];
    if (!Array.isArray(ops) || !ops.length) throw new Error('Update contains no changes');
    ops.forEach((op, i) => {
      const kind = op[0];
      if (kind === 'n') {
        const level = ['info', 'warn', 'urgent'].includes(op[1]) ? op[1] : 'info';
        p.notices = p.notices || [];
        p.notices.unshift({ id: `n${meta.seq}_${i}`, ts: meta.ts, level, text: String(op[2] || '').slice(0, 1000) });
        p.notices = p.notices.slice(0, 25);
        changes.push(`Notice (${level}): ${String(op[2] || '').slice(0, 80)}`);
      } else if (kind === 's' || kind === 'd') {
        const s = segs(op[1]); const last = s.pop();
        const parent = s.length ? walk(p, s) : p;
        if (Array.isArray(parent)) {
          const idx = parent.findIndex((x) => x && x.id === last);
          if (kind === 'd') { if (idx < 0) throw new Error('Not found: ' + op[1]); parent.splice(idx, 1); }
          else { if (!op[2] || typeof op[2] !== 'object') throw new Error('Array member must be an object'); if (idx < 0) parent.push(op[2]); else parent[idx] = op[2]; }
        } else if (parent && typeof parent === 'object') {
          if (kind === 'd') { if (!(last in parent)) throw new Error('Not found: ' + op[1]); delete parent[last]; }
          else parent[last] = op[2];
        } else throw new Error('Cannot update ' + op[1]);
        changes.push(kind === 's' ? `Changed ${op[1]}` : `Removed ${op[1]}`);
      } else if (kind === 'a') {
        const arr = walk(p, segs(op[1]));
        const item = op[2];
        if (!Array.isArray(arr) || !item || typeof item !== 'object' || !item.id) throw new Error('Invalid add at ' + op[1]);
        const idx = arr.findIndex((x) => x && x.id === item.id);
        if (idx < 0) arr.push(item); else arr[idx] = item;
        changes.push(`${idx < 0 ? 'Added' : 'Replaced'} ${op[1]}/${item.id}`);
      } else throw new Error('Unknown operation: ' + kind);
    });
    return { plan: p, changes };
  }

  function smsSegments(text) {
    const gsm = /^[A-Za-z0-9 @£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/.test(text);
    const n = text.length;
    if (gsm) return n <= 160 ? 1 : Math.ceil(n / 153);
    return n <= 70 ? 1 : Math.ceil(n / 67);
  }

  g.FCR = { b64u, unb64u, extract, decodePayload, verify, fingerprint, keyId, generateKeyPair, importPrivate,
    sign, sealKey, unsealKey, applyOps, smsSegments };
})(typeof window !== 'undefined' ? window : globalThis);
