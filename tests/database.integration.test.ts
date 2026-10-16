import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const url = process.env.TEST_DATABASE_URL;
const db = url ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }) : null;
const profileId = `test-${crypto.randomUUID()}`;

describe.skipIf(!url || process.env.TEST_DATABASE_ACK !== "isolated")("PostgreSQL integration (isolated development database)", () => {
  beforeAll(async () => { await db!.profile.create({ data: { id: profileId } }); });
  afterAll(async () => { await db!.profile.delete({ where: { id: profileId } }); await db!.$disconnect(); });

  it("enforces one active theme per profile", async () => {
    await db!.theme.create({ data: { profileId, name: "First", configuration: {}, isActive: true } });
    await expect(db!.theme.create({ data: { profileId, name: "Second", configuration: {}, isActive: true } })).rejects.toThrow();
  });

  it("enforces message length at database level", async () => {
    await expect(db!.message.create({ data: { profileId, content: "a" } })).rejects.toThrow();
    const message = await db!.message.create({ data: { profileId, content: "A valid anonymous note" } });
    expect(message.status).toBe("PENDING");
    const approved = await db!.message.update({ where: { id: message.id }, data: { status: "APPROVED", moderatedAt: new Date() } });
    expect(approved.status).toBe("APPROVED");
  });

  it("aggregates real visit events", async () => {
    await db!.analyticsEvent.createMany({ data: [{ profileId, eventType: "profile_view", pagePath: "/", visitorToken: "one" }, { profileId, eventType: "profile_view", pagePath: "/", visitorToken: "two" }] });
    const count = await db!.analyticsEvent.count({ where: { profileId, eventType: "profile_view" } });
    expect(count).toBe(2);
  });
});
