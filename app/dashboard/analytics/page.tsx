import { AnalyticsPanel } from "@/components/analytics-panel";
import { PageHeader } from "@/components/dashboard-ui";
export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Audience insights"
        title="Analytics"
        description="See how people discover and interact with your profile."
      />
      <AnalyticsPanel />
    </>
  );
}
