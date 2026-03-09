import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───

export type ThemeMode = "light" | "dark" | "system";
export type SettingsTab = "general" | "editor" | "about";

interface SettingsState {
  // General
  theme: ThemeMode;
  autoSaveInterval: number;

  // Editor
  editorFontSize: number;
  editorFontFamily: string;
  editorLineHeight: number;
  showLineNumbers: boolean;

  // UI (not persisted)
  settingsOpen: boolean;
  settingsTab: SettingsTab;
  shortcutsOpen: boolean;
}

interface SettingsActions {
  setTheme: (theme: ThemeMode) => void;
  setAutoSaveInterval: (ms: number) => void;
  setEditorFontSize: (size: number) => void;
  setEditorFontFamily: (family: string) => void;
  setEditorLineHeight: (height: number) => void;
  setShowLineNumbers: (show: boolean) => void;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setSettingsTab: (tab: SettingsTab) => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  resetSettings: () => void;
  resolvedTheme: () => "light" | "dark";
}

type SettingsStore = SettingsState & SettingsActions;

const DEFAULTS: Pick<
  SettingsState,
  | "theme"
  | "autoSaveInterval"
  | "editorFontSize"
  | "editorFontFamily"
  | "editorLineHeight"
  | "showLineNumbers"
> = {
  theme: "dark",
  autoSaveInterval: 2000,
  editorFontSize: 14,
  editorFontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace',
  editorLineHeight: 1.6,
  showLineNumbers: true,
};

export const FONT_FAMILIES = [
  { label: "JetBrains Mono", value: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace' },
  { label: "Fira Code", value: '"Fira Code", "JetBrains Mono", "SF Mono", Monaco, monospace' },
  { label: "SF Mono", value: '"SF Mono", Monaco, "Cascadia Code", "JetBrains Mono", monospace' },
  { label: "Cascadia Code", value: '"Cascadia Code", "JetBrains Mono", "Fira Code", monospace' },
  { label: "System Monospace", value: "ui-monospace, monospace" },
];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Defaults
      ...DEFAULTS,
      settingsOpen: false,
      settingsTab: "general" as SettingsTab,
      shortcutsOpen: false,

      // Setters
      setTheme: (theme) => set({ theme }),
      setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
      setEditorFontSize: (editorFontSize) =>
        set({ editorFontSize: Math.min(20, Math.max(12, editorFontSize)) }),
      setEditorFontFamily: (editorFontFamily) => set({ editorFontFamily }),
      setEditorLineHeight: (editorLineHeight) => set({ editorLineHeight }),
      setShowLineNumbers: (showLineNumbers) => set({ showLineNumbers }),

      // Modal
      openSettings: (tab) =>
        set({ settingsOpen: true, ...(tab ? { settingsTab: tab } : {}) }),
      closeSettings: () => set({ settingsOpen: false }),
      setSettingsTab: (settingsTab) => set({ settingsTab }),
      openShortcuts: () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),

      // Reset
      resetSettings: () => set({ ...DEFAULTS }),

      // Resolved theme
      resolvedTheme: () => {
        const { theme } = get();
        if (theme !== "system") return theme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      },
    }),
    {
      name: "luminote-settings",
      partialize: (state) => ({
        theme: state.theme,
        autoSaveInterval: state.autoSaveInterval,
        editorFontSize: state.editorFontSize,
        editorFontFamily: state.editorFontFamily,
        editorLineHeight: state.editorLineHeight,
        showLineNumbers: state.showLineNumbers,
      }),
    },
  ),
);
