/**
 * Admin user store backed by Cloudflare R2.
 * Credentials stored in `admin-users.json`.
 * Passwords hashed with PBKDF2-SHA-256 (100k iterations, 32-byte output).
 */

export type UserRole = 'superadmin' | 'admin';

interface AdminUser {
  username: string;
  passwordHash: string; // hex-encoded PBKDF2 output
  salt: string;         // hex-encoded random 16-byte salt
  role: UserRole;
  googleEmail?: string; // authorized Google account email, if any
}

const R2_KEY = 'admin-users.json';
const PBKDF2_ITERATIONS = 100_000;
const HASH_BYTES = 32;

async function getAdminUsers(bucket: R2Bucket): Promise<AdminUser[]> {
  const obj = await bucket.get(R2_KEY);
  if (!obj) return [];
  try {
    const parsed = JSON.parse(await obj.text());
    return Array.isArray(parsed)
      ? parsed.map((u) => ({ ...u, role: u.role ?? 'admin' })) // migrate pre-role records
      : [];
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

/**
 * Verify credentials. Returns the user's role on success, null on failure.
 * Returning the role avoids a second R2 read in the login flow.
 */
export async function verifyUser(
  bucket: R2Bucket,
  username: string,
  password: string
): Promise<UserRole | null> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  const hash = await deriveKey(password, user.salt);
  return hash === user.passwordHash ? user.role : null;
}

/** Create a new user. Defaults to role 'admin'. Throws if username already exists. */
export async function createUser(
  bucket: R2Bucket,
  username: string,
  password: string,
  role: UserRole = 'admin',
  googleEmail?: string
): Promise<void> {
  const users = await getAdminUsers(bucket);
  if (users.some((u) => u.username === username)) {
    throw new Error(`User "${username}" already exists`);
  }
  const salt = randomSaltHex();
  const passwordHash = await deriveKey(password, salt);
  const entry: AdminUser = { username, passwordHash, salt, role };
  if (googleEmail) entry.googleEmail = googleEmail.toLowerCase();
  users.push(entry);
  await saveAdminUsers(bucket, users);
}

/**
 * Delete a user. Returns false if not found.
 * Does NOT enforce hierarchy — callers must verify permissions before calling.
 */
export async function deleteUser(bucket: R2Bucket, username: string): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const filtered = users.filter((u) => u.username !== username);
  if (filtered.length === users.length) return false;
  await saveAdminUsers(bucket, filtered);
  return true;
}

/** List all users with their roles and linked Google emails. */
export async function listUsers(
  bucket: R2Bucket
): Promise<{ username: string; role: UserRole; googleEmail?: string }[]> {
  const users = await getAdminUsers(bucket);
  return users.map(({ username, role, googleEmail }) => ({ username, role, ...(googleEmail ? { googleEmail } : {}) }));
}

/** Change a user's password. Returns false if not found. */
export async function changePassword(
  bucket: R2Bucket,
  username: string,
  newPassword: string
): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  const salt = randomSaltHex();
  user.passwordHash = await deriveKey(newPassword, salt);
  user.salt = salt;
  await saveAdminUsers(bucket, users);
  return true;
}

/**
 * Set a user's role. Returns false if user not found.
 * Callers must ensure this won't remove the last superadmin.
 */
export async function setRole(bucket: R2Bucket, username: string, role: UserRole): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  user.role = role;
  await saveAdminUsers(bucket, users);
  return true;
}

/** Count how many superadmins exist (used to prevent removing the last one). */
export async function countSuperAdmins(bucket: R2Bucket): Promise<number> {
  const users = await getAdminUsers(bucket);
  return users.filter((u) => u.role === 'superadmin').length;
}

/**
 * Find a user by their linked Google email. Returns { username, role } or null.
 * Used in the OAuth callback to map a verified Google identity to an admin user.
 */
export async function findUserByGoogleEmail(
  bucket: R2Bucket,
  email: string
): Promise<{ username: string; role: UserRole } | null> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.googleEmail?.toLowerCase() === email.toLowerCase());
  return user ? { username: user.username, role: user.role } : null;
}

/** Set (or clear) the linked Google email for a user. Returns false if user not found. */
export async function setGoogleEmail(
  bucket: R2Bucket,
  username: string,
  email: string | null
): Promise<boolean> {
  const users = await getAdminUsers(bucket);
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  if (email) {
    user.googleEmail = email.toLowerCase();
  } else {
    delete user.googleEmail;
  }
  await saveAdminUsers(bucket, users);
  return true;
}
