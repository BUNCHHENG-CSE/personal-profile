import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Mail,
  MousePointer2,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { ensureProfile } from "@/lib/data";
import { OverviewChart } from "@/components/overview-chart";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
} from "@/components/dashboard-ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const profile = await ensureProfile();
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const start = new Date(today.getTime() - 6 * 86_400_000);
  const [
    totalViews,
    recentViews,
    uniqueRows,
    pendingMessages,
    messages,
    clickCount,
  ] = await Promise.all([
    db.analyticsEvent.count({
      where: { profileId: "main", eventType: "profile_view" },
    }),
    db.analyticsEvent.findMany({
      where: {
        profileId: "main",
        eventType: "profile_view",
        occurredAt: { gte: start },
      },
      select: { occurredAt: true },
    }),
    db.$queryRaw<
      { count: number }[]
    >`SELECT count(DISTINCT "visitorToken")::int AS count FROM "AnalyticsEvent" WHERE "profileId" = 'main' AND "eventType" = 'profile_view'`,
    db.message.count({ where: { profileId: "main", status: "PENDING" } }),
    db.message.findMany({
      where: { profileId: "main" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, content: true, status: true, createdAt: true },
    }),
    db.analyticsEvent.count({
      where: { profileId: "main", eventType: "social_link_click" },
    }),
  ]);
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start.getTime() + index * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return {
      date,
      views: recentViews.filter(
        (view) => view.occurredAt.toISOString().slice(0, 10) === date,
      ).length,
    };
  });

  const stats = [
    { label: "Total views", value: totalViews, detail: "All time", icon: Eye },
    {
      label: "Unique visitors",
      value: uniqueRows[0]?.count || 0,
      detail: "Estimated, all time",
      icon: Users,
    },
    {
      label: "Link clicks",
      value: clickCount,
      detail: "All time",
      icon: MousePointer2,
    },
    {
      label: "Pending messages",
      value: pendingMessages,
      detail: "Waiting for review",
      icon: Mail,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Good to see you."
        description={`Here is what is happening around @${profile.username}.`}
        action={
          <Link className="button button-secondary" href="/">
            <span>View live profile</span>
            <ArrowUpRight size={17} />
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Profile metrics">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <article className="metric-card" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <span className="metric-icon">
                <Icon size={19} strokeWidth={1.8} />
              </span>
            </div>
            <strong>{value.toLocaleString()}</strong>
            <span className="metric-detail">{detail}</span>
          </article>
        ))}
      </section>

      <div className="dashboard-columns">
        <section className="surface-card chart-card">
          <SectionHeader
            title="Audience activity"
            detail="Profile views in the last seven days, in UTC"
            action={
              <Link className="text-link" href="/dashboard/analytics">
                Full analytics <ArrowRight size={15} />
              </Link>
            }
          />
          {recentViews.length ? (
            <OverviewChart data={daily} />
          ) : (
            <EmptyState
              title="Your story starts here"
              description="Once someone visits your page, your activity chart will appear."
              icon={<Eye size={25} strokeWidth={1.5} />}
            />
          )}
        </section>
        <section className="surface-card activity-card">
          <SectionHeader
            title="Recent messages"
            detail="The latest notes from your visitors"
            action={
              <Link className="text-link" href="/dashboard/messages">
                Inbox <ArrowRight size={15} />
              </Link>
            }
          />
          {messages.length ? (
            <div className="activity-list">
              {messages.map((message) => (
                <div className="activity-item" key={message.id}>
                  <span
                    className={`status-pill ${message.status.toLowerCase()}`}
                  >
                    {message.status.toLowerCase()}
                  </span>
                  <p>{message.content}</p>
                  <small>
                    {message.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="All quiet for now"
              description="Anonymous notes will show up here after visitors send them."
              icon={<Mail size={25} strokeWidth={1.5} />}
            />
          )}
        </section>
      </div>

      <section className="quick-actions">
        <div>
          <p className="section-kicker">
            <span /> NEXT STEPS
          </p>
          <h2>Make this space yours.</h2>
          <p>
            Fine tune your profile, then give it a look from the visitor side.
          </p>
        </div>
        <div className="quick-action-links">
          <Link className="button button-primary" href="/dashboard/profile">
            Edit your profile <ArrowRight size={17} />
          </Link>
          <Link className="button button-secondary" href="/dashboard/themes">
            Explore themes <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
