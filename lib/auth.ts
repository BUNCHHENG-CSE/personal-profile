import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export function createAuth(allowProvisioning = false) {
  return betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: { enabled: true, disableSignUp: !allowProvisioning, minPasswordLength: 14 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    advanced: { defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" } },
    user: { additionalFields: { role: { type: "string", defaultValue: "admin", input: false } } },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 10, customRules: { "/sign-in/email": { window: 60, max: 5 } } },
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  });
}
export const auth = createAuth();
