import { MessageManager } from "@/components/message-manager";
import { PageHeader } from "@/components/dashboard-ui";
export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Inbox & moderation"
        title="Messages"
        description="Read visitor notes and decide what appears on your profile."
      />
      <MessageManager />
    </>
  );
}
