import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/store/settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useSettingsStore.getState().resetSettings();
    useSettingsStore.setState({ settingsOpen: false, settingsTab: "general", shortcutsOpen: false });
  });

  // ─── Default values ───

  describe("defaults", () => {
    it("has correct default theme", () => {
      expect(useSettingsStore.getState().theme).toBe("dark");
    });

    it("has correct default auto-save interval", () => {
      expect(useSettingsStore.getState().autoSaveInterval).toBe(2000);
    });

    it("has correct default editor font size", () => {
      expect(useSettingsStore.getState().editorFontSize).toBe(14);
    });

    it("has correct default line height", () => {
      expect(useSettingsStore.getState().editorLineHeight).toBe(1.6);
    });

    it("has line numbers enabled by default", () => {
      expect(useSettingsStore.getState().showLineNumbers).toBe(true);
    });

    it("has modals closed by default", () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false);
      expect(useSettingsStore.getState().shortcutsOpen).toBe(false);
    });
  });

  // ─── Setters ───

  describe("setters", () => {
    it("setTheme updates theme", () => {
      useSettingsStore.getState().setTheme("light");
      expect(useSettingsStore.getState().theme).toBe("light");
    });

    it("setAutoSaveInterval updates interval", () => {
      useSettingsStore.getState().setAutoSaveInterval(5000);
      expect(useSettingsStore.getState().autoSaveInterval).toBe(5000);
    });

    it("setEditorFontSize clamps to minimum 12", () => {
      useSettingsStore.getState().setEditorFontSize(8);
      expect(useSettingsStore.getState().editorFontSize).toBe(12);
    });

    it("setEditorFontSize clamps to maximum 20", () => {
      useSettingsStore.getState().setEditorFontSize(30);
      expect(useSettingsStore.getState().editorFontSize).toBe(20);
    });

    it("setEditorFontSize accepts valid values", () => {
      useSettingsStore.getState().setEditorFontSize(16);
      expect(useSettingsStore.getState().editorFontSize).toBe(16);
    });

    it("setShowLineNumbers toggles line numbers", () => {
      useSettingsStore.getState().setShowLineNumbers(false);
      expect(useSettingsStore.getState().showLineNumbers).toBe(false);
    });
  });

  // ─── Modal controls ───

  describe("modal controls", () => {
    it("openSettings opens settings modal", () => {
      useSettingsStore.getState().openSettings();
      expect(useSettingsStore.getState().settingsOpen).toBe(true);
    });

    it("openSettings with tab sets tab", () => {
      useSettingsStore.getState().openSettings("editor");
      expect(useSettingsStore.getState().settingsOpen).toBe(true);
      expect(useSettingsStore.getState().settingsTab).toBe("editor");
    });

    it("closeSettings closes settings modal", () => {
      useSettingsStore.getState().openSettings();
      useSettingsStore.getState().closeSettings();
      expect(useSettingsStore.getState().settingsOpen).toBe(false);
    });

    it("openShortcuts opens shortcuts modal", () => {
      useSettingsStore.getState().openShortcuts();
      expect(useSettingsStore.getState().shortcutsOpen).toBe(true);
    });

    it("closeShortcuts closes shortcuts modal", () => {
      useSettingsStore.getState().openShortcuts();
      useSettingsStore.getState().closeShortcuts();
      expect(useSettingsStore.getState().shortcutsOpen).toBe(false);
    });
  });

  // ─── resolvedTheme ───

  describe("resolvedTheme", () => {
    it("returns 'dark' when theme is dark", () => {
      useSettingsStore.getState().setTheme("dark");
      expect(useSettingsStore.getState().resolvedTheme()).toBe("dark");
    });

    it("returns 'light' when theme is light", () => {
      useSettingsStore.getState().setTheme("light");
      expect(useSettingsStore.getState().resolvedTheme()).toBe("light");
    });

    it("returns system preference when theme is system", () => {
      useSettingsStore.getState().setTheme("system");
      // Our mock returns matches=true for "(prefers-color-scheme: dark)"
      expect(useSettingsStore.getState().resolvedTheme()).toBe("dark");
    });
  });

  // ─── resetSettings ───

  describe("resetSettings", () => {
    it("restores all settings to defaults", () => {
      useSettingsStore.getState().setTheme("light");
      useSettingsStore.getState().setEditorFontSize(20);
      useSettingsStore.getState().setAutoSaveInterval(10000);

      useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe("dark");
      expect(state.editorFontSize).toBe(14);
      expect(state.autoSaveInterval).toBe(2000);
    });
  });
});
