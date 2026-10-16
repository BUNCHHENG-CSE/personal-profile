import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "better-auth/crypto";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const url = process.env.DATABASE_URL;
if (!email || !url || !process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error("Set ADMIN_EMAIL, DATABASE_URL and a 32+ character BETTER_AUTH_SECRET first.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const rl = createInterface({ input: stdin, output: stdout });
try {
  if (await db.user.count() > 0) throw new Error("An admin already exists. Provisioning is one-time only.");
  const password = await rl.question("Choose a password (at least 14 characters): ");
  if (password.length < 14) throw new Error("Password must have at least 14 characters.");
  const id = randomUUID();
  await db.$transaction(async tx => {
    if (await tx.user.count() > 0) throw new Error("Admin already exists.");
    await tx.user.create({ data: { id, email, name: "Administrator", emailVerified: true, role: "admin" } });
    await tx.account.create({ data: { id: randomUUID(), userId: id, accountId: id, providerId: "credential", password: await hashPassword(password) } });
  });
  console.log(`Provisioned ${email}. Sign in at /login.`);
} finally { rl.close(); await db.$disconnect(); }
