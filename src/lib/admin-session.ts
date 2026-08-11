const COOKIE_NAME = "admin-session";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = MAX_AGE_SECONDS;

type SessionPayload = { iat: number; exp: number };

function encode(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return secret;
}

async function signature(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return encode(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

export async function createAdminSession(now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  const payload = encode(JSON.stringify({ iat: issuedAt, exp: issuedAt + MAX_AGE_SECONDS } satisfies SessionPayload));
  return `${payload}.${await signature(payload)}`;
}

export async function verifyAdminSession(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  try {
    const expected = await signature(parts[0]);
    if (expected.length !== parts[1].length) return false;
    let difference = 0;
    for (let index = 0; index < expected.length; index++) difference |= expected.charCodeAt(index) ^ parts[1].charCodeAt(index);
    if (difference !== 0) return false;
    const payload = JSON.parse(decode(parts[0])) as Partial<SessionPayload>;
    const current = Math.floor(now / 1000);
    return Number.isInteger(payload.iat) && Number.isInteger(payload.exp) &&
      payload.iat! <= current + 60 && payload.exp! > current &&
      payload.exp! - payload.iat! === MAX_AGE_SECONDS;
  } catch {
    return false;
  }
}
