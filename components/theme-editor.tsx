"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { SectionHeader } from "@/components/dashboard-ui";

type Config = {
  accent: string;
  background: "aurora" | "grid" | "plain";
  card: "glass" | "solid";
  font: "sans" | "mono";
  glow: number;
  blur: number;
};
type Theme = {
  id: string;
  name: string;
  configuration: Config;
  isActive: boolean;
};
const defaults: Config = {
  accent: "#bb9aff",
  background: "aurora",
  card: "glass",
  font: "sans",
  glow: 60,
  blur: 18,
};
const swatches = [
  "#bb9aff",
  "#8bded0",
  "#ffb4a2",
  "#dfec86",
  "#99baff",
  "#f6b9dc",
];
const backgrounds: {
  value: Config["background"];
  label: string;
  description: string;
}[] = [
  { value: "aurora", label: "Aurora", description: "Soft light" },
  { value: "grid", label: "Grid", description: "Fine lines" },
  { value: "plain", label: "Minimal", description: "Solid tone" },
];

export function ThemeEditor({ initial }: { initial: Theme[] }) {
  const [themes, setThemes] = useState(initial);
  const first = initial.find((theme) => theme.isActive) || initial[0];
  const [selected, setSelected] = useState(first?.id || "new");
  const [draft, setDraft] = useState<{ name: string; configuration: Config }>({
    name: first?.name || "New theme",
    configuration: first?.configuration || defaults,
  });
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const existing = themes.find((theme) => theme.id === selected);

  function choose(theme: Theme) {
    setSelected(theme.id);
    setDraft({ name: theme.name, configuration: { ...theme.configuration } });
    setFeedback(null);
  }
  function create(copy = false) {
    setSelected("new");
    setDraft({
      name: copy ? `${draft.name} copy` : "New theme",
      configuration: copy ? { ...draft.configuration } : { ...defaults },
    });
    setFeedback(null);
  }
  function update<K extends keyof Config>(key: K, value: Config[K]) {
    setDraft((previous) => ({
      ...previous,
      configuration: { ...previous.configuration, [key]: value },
    }));
    setFeedback(null);
  }

  async function save(activate: boolean) {
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch(
        existing ? `/api/admin/themes/${existing.id}` : "/api/admin/themes",
        {
          method: existing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            isActive: activate || existing?.isActive || false,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save the theme.");
      const updated = result.data as Theme;
      setThemes((previous) =>
        existing
          ? previous.map((theme) =>
              theme.id === updated.id
                ? updated
                : activate
                  ? { ...theme, isActive: false }
                  : theme,
            )
          : [
              ...previous.map((theme) =>
                activate ? { ...theme, isActive: false } : theme,
              ),
              updated,
            ],
      );
      setSelected(updated.id);
      setFeedback({
        text: activate ? "Theme saved and activated." : "Theme saved.",
        error: false,
      });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error ? error.message : "Could not save the theme.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (
      !existing ||
      !window.confirm(`Delete “${existing.name}”? This cannot be undone.`)
    )
      return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/themes/${existing.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not delete the theme.");
      setThemes((previous) =>
        previous.filter((theme) => theme.id !== existing.id),
      );
      setSelected("new");
      setDraft({ name: "New theme", configuration: { ...defaults } });
      setFeedback({ text: "Theme deleted.", error: false });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Could not delete the theme.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  const previewVars = {
    "--accent": draft.configuration.accent,
    "--glow": draft.configuration.glow,
    "--blur": draft.configuration.blur,
    "--profile-font":
      draft.configuration.font === "mono"
        ? "monospace"
        : "Arial, Helvetica, sans-serif",
  } as React.CSSProperties;

  return (
    <div className="content-stack">
      <section className="surface-card theme-library">
        <SectionHeader
          title="Your themes"
          detail="Choose a saved look or start something new."
          action={
            <button
              className="button button-secondary button-small"
              onClick={() => create(false)}
            >
              <Plus size={15} /> New theme
            </button>
          }
        />
        <div className="theme-list">
          {themes.map((theme) => (
            <button
              className={`theme-tile${selected === theme.id ? " selected" : ""}`}
              type="button"
              key={theme.id}
              onClick={() => choose(theme)}
            >
              <span
                className={`theme-tile-art ${theme.configuration.background}`}
                style={
                  {
                    "--tile-accent": theme.configuration.accent,
                  } as React.CSSProperties
                }
              >
                <span />
                <span />
              </span>
              <span className="theme-tile-meta">
                <strong>{theme.name}</strong>
                <small>
                  {theme.isActive ? "Active on profile" : "Saved theme"}
                </small>
              </span>
              {theme.isActive && (
                <Check size={17} className="theme-tile-check" />
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="editor-layout theme-editor-layout">
        <div className="editor-main">
          <section className="surface-card editor-section">
            <SectionHeader
              title="Appearance"
              detail="Shape the atmosphere of your public page."
              action={
                <span className="section-icon">
                  <Palette size={19} />
                </span>
              }
            />
            <label className="form-field">
              <span>Theme name</span>
              <input
                className="input"
                maxLength={40}
                value={draft.name}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="Theme name"
              />
            </label>
            <div className="editor-divider" />
            <div className="form-field">
              <span>Accent color</span>
              <div className="color-picker-row">
                <div className="color-swatch-list">
                  {swatches.map((color) => (
                    <button
                      key={color}
                      className={`color-swatch${draft.configuration.accent === color ? " selected" : ""}`}
                      type="button"
                      aria-label={`Choose color ${color}`}
                      aria-pressed={draft.configuration.accent === color}
                      style={{ background: color }}
                      onClick={() => update("accent", color)}
                    />
                  ))}
                </div>
                <label className="custom-color" title="Choose a custom color">
                  <input
                    type="color"
                    value={draft.configuration.accent}
                    onChange={(event) => update("accent", event.target.value)}
                  />
                  <span>{draft.configuration.accent}</span>
                </label>
              </div>
            </div>
          </section>

          <section className="surface-card editor-section">
            <SectionHeader
              title="Background & card"
              detail="Pick the details that feel like you."
              action={
                <span className="section-icon">
                  <Sparkles size={19} />
                </span>
              }
            />
            <div className="form-field">
              <span>Background effect</span>
              <div className="option-grid">
                {backgrounds.map((item) => (
                  <button
                    className={`option-card${draft.configuration.background === item.value ? " selected" : ""}`}
                    type="button"
                    key={item.value}
                    onClick={() => update("background", item.value)}
                  >
                    <span className={`option-art ${item.value}`} />
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="field-grid two-col">
              <label className="form-field">
                <span>Card finish</span>
                <select
                  className="input"
                  value={draft.configuration.card}
                  onChange={(event) =>
                    update("card", event.target.value as Config["card"])
                  }
                >
                  <option value="glass">Frosted glass</option>
                  <option value="solid">Solid surface</option>
                </select>
              </label>
              <label className="form-field">
                <span>Typography</span>
                <select
                  className="input"
                  value={draft.configuration.font}
                  onChange={(event) =>
                    update("font", event.target.value as Config["font"])
                  }
                >
                  <option value="sans">Modern sans</option>
                  <option value="mono">Monospace</option>
                </select>
              </label>
            </div>
            <label className="range-field">
              <span>
                <strong>Glow intensity</strong>
                <em>{draft.configuration.glow}%</em>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={draft.configuration.glow}
                onChange={(event) => update("glow", Number(event.target.value))}
              />
            </label>
            <label className="range-field">
              <span>
                <strong>Glass blur</strong>
                <em>{draft.configuration.blur}px</em>
              </span>
              <input
                type="range"
                min="0"
                max="40"
                value={draft.configuration.blur}
                onChange={(event) => update("blur", Number(event.target.value))}
              />
            </label>
          </section>
        </div>
        <aside className="editor-aside">
          <div className="preview-heading">
            <span>
              <i /> LIVE PREVIEW
            </span>
            <small>Updates as you edit</small>
          </div>
          <div
            className={`theme-preview scene ${draft.configuration.background}`}
            style={previewVars}
          >
            <div className={`profile-card compact ${draft.configuration.card}`}>
              <div className="profile-banner" />
              <div className="profile-card-body">
                <div className="profile-avatar">A</div>
                <h3>Your name</h3>
                <span className="profile-handle">@yourname</span>
                <p>A little about you goes here.</p>
                <div className="preview-link-list">
                  <div>
                    <span>↗</span>
                    <span>Your favorite link</span>
                    <span>↗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="preview-caption">
            The public profile reflects your active saved theme.
          </p>
        </aside>
      </div>

      <div className="save-dock">
        <div className="save-status">
          {feedback ? (
            <span
              className={feedback.error ? "error-text" : "success-text"}
              role="status"
            >
              {feedback.error ? "!" : <Check size={16} />}
              {feedback.text}
            </span>
          ) : (
            <span>
              {existing?.isActive
                ? "Editing your active theme"
                : existing
                  ? "Editing a saved theme"
                  : "Creating a new theme"}
            </span>
          )}
        </div>
        <div className="save-actions">
          <button
            className="button button-quiet"
            type="button"
            onClick={() => create(true)}
          >
            <Copy size={16} /> Duplicate
          </button>
          <button
            className="button button-quiet"
            type="button"
            onClick={() =>
              setDraft({ name: "Default", configuration: { ...defaults } })
            }
          >
            <RotateCcw size={16} /> Reset draft
          </button>
          <button
            className="button button-quiet danger-text"
            type="button"
            disabled={!existing || existing.isActive || busy}
            onClick={remove}
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            className="button button-secondary"
            type="button"
            disabled={busy}
            onClick={() => save(false)}
          >
            <Save size={16} /> Save
          </button>
          <button
            className="button button-primary"
            type="button"
            disabled={busy}
            onClick={() => save(true)}
          >
            <Check size={16} /> Save & activate
          </button>
        </div>
      </div>
    </div>
  );
}
