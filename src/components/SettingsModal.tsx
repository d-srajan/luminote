import { useEffect, useRef } from "react";
import {
  X,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import {
  useSettingsStore,
  FONT_FAMILIES,
  type ThemeMode,
  type SettingsTab,
} from "@/store/settingsStore";

// ─── Tab config ───

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "editor", label: "Editor" },
  { id: "about", label: "About" },
];

// ─── Main modal ───

export function SettingsModal() {
  const {
    settingsOpen,
    settingsTab,
    closeSettings,
    setSettingsTab,
    resetSettings,
  } = useSettingsStore();

  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSettings();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, closeSettings]);

  if (!settingsOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) closeSettings();
      }}
    >
      <div className="flex h-[520px] w-[640px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Settings
          </h2>
          <button
            onClick={closeSettings}
            className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tab sidebar */}
          <nav className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                  settingsTab === tab.id
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/50 hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            {settingsTab === "general" && <GeneralTab />}
            {settingsTab === "editor" && <EditorTab />}
            {settingsTab === "about" && <AboutTab />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-3">
          <button
            onClick={resetSettings}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          >
            <RotateCcw size={12} />
            Reset to Defaults
          </button>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Changes are saved automatically
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── General tab ───

function GeneralTab() {
  const { theme, setTheme, autoSaveInterval, setAutoSaveInterval } =
    useSettingsStore();

  const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Theme */}
      <SettingRow label="Theme" description="Choose the app color scheme">
        <div className="flex gap-1.5">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                theme === value
                  ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30"
                  : "bg-[var(--color-bg-surface)]/50 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Auto-save interval */}
      <SettingRow
        label="Auto-save Interval"
        description="How often unsaved changes are automatically saved"
      >
        <select
          value={autoSaveInterval}
          onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        >
          <option value={1000}>1 second</option>
          <option value={2000}>2 seconds</option>
          <option value={5000}>5 seconds</option>
          <option value={10000}>10 seconds</option>
        </select>
      </SettingRow>
    </div>
  );
}

// ─── Editor tab ───

function EditorTab() {
  const {
    editorFontSize,
    setEditorFontSize,
    editorFontFamily,
    setEditorFontFamily,
    editorLineHeight,
    setEditorLineHeight,
    showLineNumbers,
    setShowLineNumbers,
  } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Font size */}
      <SettingRow
        label="Font Size"
        description={`${editorFontSize}px`}
      >
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={12}
            max={20}
            value={editorFontSize}
            onChange={(e) => setEditorFontSize(Number(e.target.value))}
            className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-[var(--color-bg-surface)] accent-[var(--color-accent)]"
          />
          <span className="w-8 text-right text-xs tabular-nums text-[var(--color-text-secondary)]">
            {editorFontSize}px
          </span>
        </div>
      </SettingRow>

      {/* Font family */}
      <SettingRow label="Font Family" description="Monospace font for the editor">
        <select
          value={editorFontFamily}
          onChange={(e) => setEditorFontFamily(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </SettingRow>

      {/* Line height */}
      <SettingRow label="Line Height" description="Space between lines in the editor">
        <select
          value={editorLineHeight}
          onChange={(e) => setEditorLineHeight(Number(e.target.value))}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        >
          <option value={1.4}>Compact (1.4)</option>
          <option value={1.6}>Normal (1.6)</option>
          <option value={1.8}>Relaxed (1.8)</option>
          <option value={2.0}>Spacious (2.0)</option>
        </select>
      </SettingRow>

      {/* Line numbers */}
      <SettingRow label="Line Numbers" description="Show line numbers in the gutter">
        <button
          onClick={() => setShowLineNumbers(!showLineNumbers)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            showLineNumbers
              ? "bg-[var(--color-accent)]"
              : "bg-[var(--color-bg-surface)]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              showLineNumbers ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </SettingRow>
    </div>
  );
}

// ─── About tab ───

function AboutTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-[var(--color-accent)]">
          Luminote
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Version 0.1.0
        </p>
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        An open-source, local-first note-taking app. Your notes live on your
        machine — no cloud, no accounts, no tracking.
      </p>

      <div className="flex flex-col gap-3">
        <InfoRow label="License" value="MIT" />
        <InfoRow label="Framework" value="Tauri 2 + React 18" />
        <InfoRow label="Editor" value="CodeMirror 6" />
      </div>

      <a
        href="https://github.com/d-srajan/luminote"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-fit items-center gap-1.5 rounded-md bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/15"
      >
        <ExternalLink size={12} />
        View on GitHub
      </a>

      <div className="mt-2 border-t border-[var(--color-border)] pt-3">
        <p className="text-[10px] text-[var(--color-text-muted)]">
          Built with Tauri, React, TypeScript, TailwindCSS, and CodeMirror.
        </p>
      </div>
    </div>
  );
}

// ─── Shared components ───

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-[var(--color-text-primary)]">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {description}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-xs text-[var(--color-text-secondary)]">{value}</span>
    </div>
  );
}
