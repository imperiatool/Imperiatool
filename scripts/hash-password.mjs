#!/usr/bin/env node
// Prints the hash to put in VITE_ADMIN_PASSWORD_HASH (or the GitHub secret).
// Usage:  npm run admin:hash -- "my secret password"
import { createHash } from 'node:crypto';

const password = process.argv.slice(2).join(' ');
if (!password || password.length < 8) {
  console.error('Usage: npm run admin:hash -- "password (min 8 characters)"');
  process.exit(1);
}
console.log(createHash('sha256').update(`imperia-admin:${password}`).digest('hex'));
