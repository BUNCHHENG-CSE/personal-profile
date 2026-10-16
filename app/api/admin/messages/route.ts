import { db } from "@/lib/db";
import { admin, failure, json } from "@/lib/security";
import { z } from "zod";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!await admin()) return failure("Unauthorized", 401);
  const params = new URL(request.url).searchParams;
  const parsed = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(), page: z.coerce.number().int().min(1).max(10000).default(1), q: z.string().max(100).default("") }).safeParse(Object.fromEntries(params));
  if (!parsed.success) return failure("Invalid filter", 400);
  const { status, page, q } = parsed.data;
  const where = { profileId: "main", ...(status ? { status } : {}), ...(q ? { content: { contains: q, mode: "insensitive" as const } } : {}) };
  const [items, total] = await Promise.all([db.message.findMany({ where, take: 20, skip: (page - 1) * 20, orderBy: { createdAt: "desc" } }), db.message.count({ where })]);
  return json({ data: { items, total, page, pages: Math.ceil(total / 20) } });
}
