import { CheckCircle2, Cloud, CloudOff, Database, ShieldCheck } from "lucide-react";
import { editableProfile, ensureProfile } from "@/lib/data";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { PageHeader, SectionHeader } from "@/components/dashboard-ui";
import { SettingsEditor } from "@/components/settings-editor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const profile = await ensureProfile();
  const cloudinaryConnected = isCloudinaryConfigured();

  return (
    <>
      <PageHeader
        eyebrow="Preferences & privacy"
        title="Settings"
        description="Decide how your profile works behind the scenes."
      />
      <SettingsEditor initial={editableProfile(profile)} />
      <section className="surface-card service-card">
        <SectionHeader
          title="Connected services"
          detail="A quick look at the infrastructure powering your page."
        />
        <div className="service-grid">
          <div className="service-item">
            <span className="service-icon">
              <Database size={19} />
            </span>
            <div>
              <strong>PostgreSQL</strong>
              <small>Profile data, messages and analytics</small>
            </div>
            <span className="service-state">
              <CheckCircle2 size={15} /> Connected
            </span>
          </div>
          <div className="service-item">
            <span className="service-icon">
              <ShieldCheck size={19} />
            </span>
            <div>
              <strong>Rate limiting</strong>
              <small>Shared PostgreSQL buckets</small>
            </div>
            <span className="service-state">
              <CheckCircle2 size={15} /> Enabled
            </span>
          </div>
          <div className="service-item">
            <span className="service-icon">
              {cloudinaryConnected ? <Cloud size={19} /> : <CloudOff size={19} />}
            </span>
            <div>
              <strong>Cloudinary uploads</strong>
              <small>
                {cloudinaryConnected
                  ? "Image and audio media storage active"
                  : "Use HTTPS image URLs instead"}
              </small>
            </div>
            <span
              className={`service-state ${cloudinaryConnected ? "" : "neutral"}`}
            >
              {cloudinaryConnected ? (
                <>
                  <CheckCircle2 size={15} /> Connected
                </>
              ) : (
                "Not configured"
              )}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
