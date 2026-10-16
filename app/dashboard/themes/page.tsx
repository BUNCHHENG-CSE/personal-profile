import { db } from "@/lib/db";
import { ensureProfile } from "@/lib/data";
import { ThemeEditor } from "@/components/theme-editor";
import { PageHeader } from "@/components/dashboard-ui";
export const dynamic = "force-dynamic";
export default async function Page() {
  await ensureProfile();
  const themes = await db.theme.findMany({
    where: { profileId: "main" },
    orderBy: { createdAt: "asc" },
  });
  return (
    <>
      <PageHeader
        eyebrow="Visual identity"
        title="Themes"
        description="Build a look that feels unmistakably yours."
      />
      <ThemeEditor
        initial={themes.map((t) => ({
          id: t.id,
          name: t.name,
          configuration: t.configuration as {
            accent: string;
            background: "aurora" | "grid" | "plain";
            card: "glass" | "solid";
            font: "sans" | "mono";
            glow: number;
            blur: number;
          },
          isActive: t.isActive,
        }))}
      />
    </>
  );
}
