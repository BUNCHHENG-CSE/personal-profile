import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { body, failure, hash, json, rateLimit, sameOrigin } from "@/lib/security";
import { eventInput, socialLink } from "@/lib/validation";
import {
  extractGeoFromRequest,
  parseReferrer,
  parseUserAgent,
  recordVisitorSession,
  type VisitorSessionLog,
} from "@/lib/visitor";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Invalid origin", 403);

  try {
    if (!await rateLimit(request, "analytics", 60, 3600)) {
      return failure("Too many requests", 429);
    }

    const payload = await body(request, 2048);
    const parsed = eventInput.safeParse(payload);
    if (!parsed.success) {
      return failure("Invalid event", 400);
    }

    // Extract rich visitor details
    const userAgent = request.headers.get("user-agent");
    const { deviceType, os, browser } = parseUserAgent(userAgent);
    const geo = extractGeoFromRequest(request);
    const clientReferrer = parsed.data.referrer || request.headers.get("referer");
    const referrerMeta = parseReferrer(clientReferrer);

    const cookie = request.headers.get("cookie")?.match(/(?:^|; )visitor=([a-zA-Z0-9-]{36})(?:;|$)/)?.[1];
    const isNewVisitor = !cookie;
    const visitor = cookie || randomUUID();
    const visitorToken = hash(visitor);

    const pagePath = parsed.data.pagePath || "/";
    let actionDesc = "Viewed Profile";
    let linkId: string | undefined = undefined;

    if (parsed.data.eventType === "social_link_click") {
      linkId = parsed.data.linkId;
      actionDesc = `Clicked Link: ${linkId}`;
    } else if (parsed.data.eventType === "interaction") {
      actionDesc = parsed.data.action;
    } else if (parsed.data.action) {
      actionDesc = parsed.data.action;
    }

    // Record detailed visitor session in the server's telemetry engine
    const sessionLog: VisitorSessionLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      pagePath,
      countryCode: geo.countryCode,
      countryName: geo.countryName,
      countryFlag: geo.countryFlag,
      deviceType,
      os,
      browser,
      referrer: referrerMeta.referrer,
      referrerDomain: referrerMeta.referrerDomain,
      action: actionDesc,
      linkId,
      isNewVisitor,
    };

    recordVisitorSession(sessionLog);

    // Persist to Postgres database if available
    try {
      const profile = await db.profile.findUnique({ where: { id: "main" } });
      if (profile && profile.analyticsEnabled !== false) {
        if (parsed.data.eventType === "social_link_click") {
          const parsedLinks = z.array(socialLink).safeParse(profile.socialLinks);
          if (parsedLinks.success && parsedLinks.data.some((link) => link.id === linkId)) {
            await db.analyticsEvent.create({
              data: {
                profileId: "main",
                eventType: "social_link_click",
                pagePath,
                visitorToken,
                linkId,
              },
            });
          }
        } else if (parsed.data.eventType === "profile_view") {
          await db.$transaction(async (tx) => {
            await tx.$queryRaw`WITH lock_result AS ( SELECT pg_advisory_xact_lock( hashtextextended(${visitorToken}, 0))) SELECT TRUE AS locked FROM lock_result`;
            const since = new Date(Date.now() - 30 * 60 * 1000);
            const duplicate = await tx.analyticsEvent.findFirst({
              where: {
                visitorToken,
                eventType: "profile_view",
                occurredAt: { gte: since },
              },
              select: { id: true },
            });

            if (!duplicate) {
              await tx.analyticsEvent.create({
                data: {
                  profileId: "main",
                  eventType: "profile_view",
                  pagePath,
                  visitorToken,
                },
              });
            }
          });
        }
      }
    } catch (dbError) {
      // Graceful fallback if database connection times out
      console.warn("Database analytics write skipped:", dbError instanceof Error ? dbError.message : "connection timeout");
    }

    const response = json({ data: { recorded: true, session: sessionLog } }, 202);

    if (!cookie) {
      response.headers.append(
        "Set-Cookie",
        `visitor=${visitor}; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
      );
    }

    return response;
  } catch (error) {
    console.warn("Analytics event recording error:", error instanceof Error ? error.message : "unknown");
    return json({ data: { recorded: false } }, 202);
  }
}