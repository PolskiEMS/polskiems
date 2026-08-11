import assert from "node:assert/strict";
import test from "node:test";
import { createAdminSession, verifyAdminSession } from "../src/lib/admin-session.ts";

process.env.ADMIN_SESSION_SECRET = "test-only-secret-with-at-least-thirty-two-characters";
const now = Date.UTC(2026, 0, 1);
test("accepts valid session", async () => assert.equal(await verifyAdminSession(await createAdminSession(now), now + 1_000), true));
test("rejects forged legacy cookie", async () => assert.equal(await verifyAdminSession("true", now), false));
test("rejects modified token", async () => { const token = await createAdminSession(now); assert.equal(await verifyAdminSession(`${token.slice(0, -1)}x`, now), false); });
test("rejects expired token", async () => { const token = await createAdminSession(now); assert.equal(await verifyAdminSession(token, now + 8 * 60 * 60 * 1_000 + 1), false); });
