import { editableProfile, ensureProfile } from "@/lib/data";
import { ProfileEditor } from "@/components/profile-editor";
import { PageHeader } from "@/components/dashboard-ui";
export const dynamic = "force-dynamic";
export default async function Page() {
  const profile = await ensureProfile();
  return (
    <>
      <PageHeader
        eyebrow="Your identity"
        title="Profile editor"
        description="Every detail of your public page, all in one place."
      />
      <ProfileEditor initial={editableProfile(profile)} />
    </>
  );
}
