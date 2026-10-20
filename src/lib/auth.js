// Admin password gate.
//
// The password is never stored: only SHA-256("imperia-admin:" + password).
// Source of truth, in order:
//   1. VITE_ADMIN_PASSWORD_HASH (set at build time, e.g. a GitHub secret)
//   2. a hash created from the Admin "first setup" screen (this browser only)
//
// IMPORTANT: on a static site this protects the Admin *interface*. Anyone can
// still read the JS bundle; data shared between admins needs a real backend.

const PREFIX = 'imperia-admin:';
const LOCAL_HASH_KEY = 'imperia:admin-hash';
const SESSION_KEY = 'imperia:admin-session';
const LOCK_KEY = 'imperia:admin-lock';
const SESSION_HOURS = 8;
const MAX_FAILS = 5;
const LOCK_SECONDS = 60;

export const ENV_HASH = (import.meta.env?.VITE_ADMIN_PASSWORD_HASH || '').trim().toLowerCase();
export const MIN_PASSWORD_LENGTH = 8;

/* ---------- SHA-256 (WebCrypto, with a pure-JS fallback for http:// LAN) -- */
function sha256Js(bytes) {
  const ror = (x, n) => (x >>> n) | (x << (32 - n));
  const H = [];
  const K = [];
  for (let c = 2, n = 0; n < 64; c++) {
    let prime = true;
    for (let d = 2; d * d <= c; d++) if (c % d === 0) { prime = false; break; }
    if (!prime) continue;
    if (n < 8) H[n] = (Math.pow(c, 1 / 2) * 2 ** 32) | 0;
    K[n] = (Math.pow(c, 1 / 3) * 2 ** 32) | 0;
    n++;
  }
  const l = bytes.length;
  const total = (((l + 9) >> 6) + 1) << 6;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[l] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 4, (l * 8) >>> 0);
  dv.setUint32(total - 8, Math.floor((l * 8) / 2 ** 32));
  const W = new Array(64);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = ror(W[i - 15], 7) ^ ror(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = ror(W[i - 2], 17) ^ ror(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return sha256Js(bytes);
}
export { sha256Js as _sha256Js };

export const hashPassword = (password) => sha256Hex(PREFIX + password);

/* ---------- configuration ------------------------------------------------ */
const store = {
  get: (k, s = localStorage) => {
    try { return s.getItem(k); } catch { return null; }
  },
  set: (k, v, s = localStorage) => {
    try { s.setItem(k, v); } catch { /* storage unavailable */ }
  },
  del: (k, s = localStorage) => {
    try { s.removeItem(k); } catch { /* storage unavailable */ }
  },
};

export function configuredHash() {
  return ENV_HASH || store.get(LOCAL_HASH_KEY) || '';
}
export const isEnvManaged = () => !!ENV_HASH;
export const needsSetup = () => !configuredHash();

export async function setupPassword(password) {
  if (isEnvManaged()) throw new Error('env-managed');
  store.set(LOCAL_HASH_KEY, await hashPassword(password));
  startSession();
}

export async function changePassword(current, next) {
  if (isEnvManaged()) throw new Error('env-managed');
  if (!(await verifyPassword(current))) return false;
  store.set(LOCAL_HASH_KEY, await hashPassword(next));
  return true;
}

/* ---------- sessions & lockout ------------------------------------------- */
export function hasSession() {
  const until = Number(store.get(SESSION_KEY, sessionStorage) || 0);
  return until > Date.now() && !needsSetup();
}
function startSession() {
  store.set(SESSION_KEY, String(Date.now() + SESSION_HOURS * 3600e3), sessionStorage);
}
export function logout() {
  store.del(SESSION_KEY, sessionStorage);
}

/** seconds left before a new attempt is allowed (0 = allowed) */
export function lockRemaining() {
  try {
    const { until = 0 } = JSON.parse(store.get(LOCK_KEY) || '{}');
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

async function verifyPassword(password) {
  const expected = configuredHash();
  return !!expected && (await hashPassword(password)) === expected;
}

/** @returns 'ok' | 'wrong' | 'locked' */
export async function login(password) {
  if (lockRemaining() > 0) return 'locked';
  if (await verifyPassword(password)) {
    store.del(LOCK_KEY);
    startSession();
    return 'ok';
  }
  let fails = 0;
  try { fails = JSON.parse(store.get(LOCK_KEY) || '{}').fails || 0; } catch { /* ignore */ }
  fails += 1;
  const until = fails >= MAX_FAILS ? Date.now() + LOCK_SECONDS * 1000 : 0;
  store.set(LOCK_KEY, JSON.stringify({ fails: fails >= MAX_FAILS ? 0 : fails, until }));
  return until ? 'locked' : 'wrong';
}
