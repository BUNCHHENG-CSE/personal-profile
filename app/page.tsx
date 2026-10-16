import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { ProfileView } from "@/components/profile-view";
import { publicProfile } from "@/lib/data";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await publicProfile();
    return {
      title: profile.seoTitle,
      description: profile.seoDescription,
      openGraph: {
        title: profile.seoTitle,
        description: profile.seoDescription,
        images: profile.avatarUrl ? [profile.avatarUrl] : [],
      },
    };
  } catch {
    return {
      title: process.env.DATABASE_URL ? "Profile unavailable" : "Profile setup",
      description: "A personal profile and links.",
    };
  }
}

export default async function Home() {
  let result: {
    profile: Awaited<ReturnType<typeof publicProfile>>;
    views: number;
    messages: { id: string; content: string }[];
  } | null = null;

  try {
    const profile = await publicProfile();
    const [views, messages] = await Promise.all([
      db.analyticsEvent.count({
        where: { profileId: "main", eventType: "profile_view" },
      }),
      profile.publicMessages
        ? db.message.findMany({
            where: { profileId: "main", status: "APPROVED" },
            orderBy: { moderatedAt: "desc" },
            take: 3,
            select: { id: true, content: true },
          })
        : Promise.resolve([]),
    ]);
    result = { profile, views, messages };
  } catch {
    // The setup screen also covers a temporarily unavailable database.
  }

  if (result) return <ProfileView {...result} />;

  const configured = Boolean(process.env.DATABASE_URL);
  return (
    <main className="public-scene scene aurora">
      <div className="setup-shell">
        <Link href="/" className="public-brand">
          <span className="public-brand-mark">
            <Zap size={18} fill="currentColor" />
          </span>
          <strong>
            Arzur Sanctum<span>.</span>
          </strong>
        </Link>
        <div className="setup-content">
          <p className="public-kicker">
            {configured ? "TEMPORARILY UNAVAILABLE" : "FIRST RUN"}
          </p>
          <h1>
            {configured ? (
              <>
                Back
                <br />
                <em>soon.</em>
              </>
            ) : (
              <>
                Your space
                <br />
                <em>starts here.</em>
              </>
            )}
          </h1>
          <p>
            {configured
              ? "The profile could not be loaded. Please try again later."
              : "Connect PostgreSQL, apply the migration, and provision your admin account. The README has each command."}
          </p>
          {!configured && (
            <Link className="public-button public-button-primary" href="/login">
              Open admin login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
