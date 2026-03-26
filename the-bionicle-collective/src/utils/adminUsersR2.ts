/**
 * Admin user store backed by Cloudflare R2.
 * Credentials stored in `admin-users.json`.
 * Passwords hashed with PBKDF2-SHA-256 (100k iterations, 32-byte output).
 */

interface AdminUser {
  username: string;
  passwordHash: string; // hex-encoded PBKDF2 output
  salt: string;         // hex-encoded random 16-byte salt
}

const R2_KEY = 'admin-users.json';
const PBKDF2_ITERATIONS = 100_000;
const HASH_BYTES = 32;

async function getAdminUsers(bucket: R2Bucket): Promise<AdminUser[]> {
  const obj = await bucket.get(R2_KEY);
  if (!obj) return [];
  try {
    const parsed = JSON.parse(await obj.text());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAdminUsers(bucket: R2Bucket, users: AdminUser[]): Promise<void> {
  await bucket.put(R2_KEY, JSON.stringify(users, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });
}

async function deriveKey(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBytes = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    HASH_BYTES * 8
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSaltHex(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyUser(bucket: R2Bucket, username: string, password: string): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  const hash = await deriveKey(password, user.salt);
  return hash === user.passwordHash;
}

export async function createUser(bucket: R2Bucket, username: string, password: string): Promise<void> {
  const users = await getAdminUsers(bucket);
  if (users.some((u) => u.username === username)) {
    throw new Error(`User "${username}" already exists`);
  }
  const salt = randomSaltHex();
  const passwordHash = await deriveKey(password, salt);
  users.push({ username, passwordHash, salt });
  await saveAdminUsers(bucket, users);
}

export async function deleteUser(bucket: R2Bucket, username: string): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const filtered = users.filter((u) => u.username !== username);
  if (filtered.length === users.length) return false;
  await saveAdminUsers(bucket, filtered);
  return true;
}

export async function listUsers(bucket: R2Bucket): Promise<string[]> {
  const users = await getAdminUsers(bucket);
  return users.map((u) => u.username);
}

export async function changePassword(bucket: R2Bucket, username: string, newPassword: string): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  const salt = randomSaltHex();
  user.passwordHash = await deriveKey(newPassword, salt);
  user.salt = salt;
  await saveAdminUsers(bucket, users);
  return true;
}
