"use client";

import { useState } from "react";
import {
  BarChart3,
  Check,
  Clock3,
  Eye,
  LockKeyhole,
  MessageSquareText,
  Save,
  Trash2,
} from "lucide-react";
import { SectionHeader } from "@/components/dashboard-ui";

type Profile = {
  displayName: string;
  username: string;
  bio: string;
  status: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  musicUrl: string | null;
  trackTitle: string | null;
  trackArtist: string | null;
  seoTitle: string;
  seoDescription: string;
  socialLinks: unknown[];
  publicMessages: boolean;
  messagesEnabled: boolean;
  analyticsEnabled: boolean;
  retentionDays: number;
};

const controls = [
  {
    key: "analyticsEnabled" as const,
    title: "Profile analytics",
    description: "Record privacy conscious views and social link clicks.",
    icon: BarChart3,
  },
  {
    key: "messagesEnabled" as const,
    title: "Anonymous messages",
    description: "Let visitors send notes without creating an account.",
    icon: MessageSquareText,
  },
  {
    key: "publicMessages" as const,
    title: "Public message wall",
    description: "Show only messages that you have approved.",
    icon: Eye,
  },
];

export function SettingsEditor({ initial }: { initial: Profile }) {
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  async function save() {
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save settings.");
      setFeedback({ text: "Settings saved.", error: false });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error ? error.message : "Could not save settings.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  async function cleanup() {
    if (
      !window.confirm(
        `Delete messages and analytics events older than ${settings.retentionDays} days? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/cleanup", { method: "POST" });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not delete expired data.");
      setFeedback({
        text: `Cleanup complete: ${result.data.events} events and ${result.data.messages} messages deleted.`,
        error: false,
      });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Could not delete expired data.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-grid">
      <div className="content-stack">
        <section className="surface-card editor-section">
          <SectionHeader
            title="Experience controls"
            detail="Choose what visitors can do and what you measure."
            action={
              <span className="section-icon">
                <LockKeyhole size={19} />
              </span>
            }
          />
          <div className="setting-list">
            {controls.map(({ key, title, description, icon: Icon }) => (
              <label className="setting-row" key={key}>
                <span className="setting-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(event) =>
                    setSettings((previous) => ({
                      ...previous,
                      [key]: event.target.checked,
                    }))
                  }
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Data retention"
            detail="Choose how long events and messages remain in your database."
            action={
              <span className="section-icon">
                <Clock3 size={19} />
              </span>
            }
          />
          <div className="retention-field">
            <label className="form-field">
              <span>Keep data for</span>
              <div className="retention-input">
                <input
                  className="input"
                  type="number"
                  min={7}
                  max={365}
                  value={settings.retentionDays}
                  onChange={(event) =>
                    setSettings((previous) => ({
                      ...previous,
                      retentionDays: Number(event.target.value),
                    }))
                  }
                />
                <span>days</span>
              </div>
            </label>
            <p>
              Between 7 and 365 days. Cleanup runs when you choose the action
              below; it is not automatic.
            </p>
          </div>
          <div className="divider-line" />
          <div className="retention-action">
            <div>
              <strong>Delete expired data</strong>
              <p>Remove older events, messages, and rate limit records.</p>
            </div>
            <button
              className="button button-danger"
              type="button"
              disabled={busy}
              onClick={cleanup}
            >
              <Trash2 size={16} /> Run cleanup
            </button>
          </div>
        </section>
      </div>
      <aside className="settings-aside">
        <section className="surface-card privacy-card">
          <div className="privacy-icon">
            <LockKeyhole size={21} />
          </div>
          <h2>Privacy by design</h2>
          <p>
            Visitor analytics use a first party cookie to estimate unique
            visitors. Message and analytics records do not store raw visitor
            IPs.
          </p>
          <div className="privacy-detail">
            <span>Visitor data</span>
            <strong>Minimal</strong>
          </div>
          <div className="privacy-detail">
            <span>Message review</span>
            <strong>Manual</strong>
          </div>
          <div className="privacy-detail">
            <span>Cleanup</span>
            <strong>On demand</strong>
          </div>
        </section>
      </aside>
      <div className="save-dock">
        <div className="save-status">
          {feedback ? (
            <span
              role="status"
              className={feedback.error ? "error-text" : "success-text"}
            >
              {!feedback.error && <Check size={16} />}
              {feedback.text}
            </span>
          ) : (
            <span>Changes are applied when you save</span>
          )}
        </div>
        <div className="save-actions">
          <button
            className="button button-primary"
            type="button"
            disabled={busy}
            onClick={save}
          >
            <Save size={16} />
            {busy ? "Working..." : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
