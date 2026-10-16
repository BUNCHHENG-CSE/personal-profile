import { describe, expect, it } from "vitest";
const base = process.env.TEST_BASE_URL;
const allowed = !!base && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base) && process.env.TEST_DATABASE_ACK === "isolated";
describe.skipIf(!allowed)("running development server", () => {
  it("returns only public profile data", async () => {
    const response = await fetch(`${base}/api/profile`);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveProperty("theme");
    expect(payload.data).not.toHaveProperty("password");
    expect(payload.data).not.toHaveProperty("retentionDays");
  });
  it("blocks unauthenticated dashboard and API access", async () => {
    const page = await fetch(`${base}/dashboard`, { redirect: "manual" });
    expect(page.status).toBeGreaterThanOrEqual(300);
    expect(page.status).toBeLessThan(400);
    const api = await fetch(`${base}/api/admin/profile`);
    expect(api.status).toBe(401);
    const mutation = await fetch(`${base}/api/admin/profile`, { method: "PATCH", headers: { Origin: base!, "Content-Type": "application/json" }, body: "{}" });
    expect(mutation.status).toBe(401);
  });
  it("rejects malformed public writes", async () => {
    const headers = { Origin: base!, "Content-Type": "application/json" };
    const message = await fetch(`${base}/api/messages`, { method: "POST", headers, body: JSON.stringify({ content: "x" }) });
    expect(message.status).toBe(400);
    const event = await fetch(`${base}/api/analytics/events`, { method: "POST", headers, body: JSON.stringify({ eventType: "purchase", pagePath: "/" }) });
    expect(event.status).toBe(400);
  });
  it("deduplicates a repeated profile view for one visitor cookie", async () => {
    const headers = { Origin: base!, "Content-Type": "application/json" };
    const payload = JSON.stringify({ eventType: "profile_view", pagePath: "/" });
    const first = await fetch(`${base}/api/analytics/events`, { method: "POST", headers, body: payload });
    expect(first.status).toBe(202);
    const cookie = first.headers.getSetCookie().map(item => item.split(";")[0]).join("; ");
    expect(cookie).toContain("visitor=");
    const second = await fetch(`${base}/api/analytics/events`, { method: "POST", headers: { ...headers, Cookie: cookie }, body: payload });
    expect((await second.json()).data.recorded).toBe(false);
  });
  it("returns 429 after the shared analytics limit", async () => {
    const headers = { Origin: base!, "Content-Type": "application/json" };
    let limited = false;
    for (let i = 0; i < 31; i++) {
      const response = await fetch(`${base}/api/analytics/events`, { method: "POST", headers, body: JSON.stringify({ eventType: "unsupported", pagePath: "/" }) });
      if (response.status === 429) { limited = true; break; }
    }
    expect(limited).toBe(true);
  });
});

describe.skipIf(!allowed || !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD)("administrator session", () => {
  it("signs in and invalidates the session on logout", async () => {
    const headers = { Origin: base!, "Content-Type": "application/json" };
    const login = await fetch(`${base}/api/auth/sign-in/email`, { method: "POST", headers, body: JSON.stringify({ email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD }) });
    expect(login.status).toBe(200);
    const cookie = login.headers.getSetCookie().map(item => item.split(";")[0]).join("; ");
    expect(cookie).toContain("session_token");
    const session = await fetch(`${base}/api/auth/get-session`, { headers: { Cookie: cookie } });
    expect((await session.json()).user.email).toBe(process.env.TEST_ADMIN_EMAIL);
    const logout = await fetch(`${base}/api/auth/sign-out`, { method: "POST", headers: { ...headers, Cookie: cookie }, body: "{}" });
    expect(logout.ok).toBe(true);
    const after = await fetch(`${base}/api/auth/get-session`, { headers: { Cookie: cookie } });
    expect(await after.json()).toBeNull();
  });
});
