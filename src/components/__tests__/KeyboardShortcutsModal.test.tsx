import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { useSettingsStore } from "@/store/settingsStore";

describe("KeyboardShortcutsModal", () => {
  beforeEach(() => {
    useSettingsStore.setState({ shortcutsOpen: false });
  });

  it("does not render when closed", () => {
    render(<KeyboardShortcutsModal />);
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    useSettingsStore.setState({ shortcutsOpen: true });
    render(<KeyboardShortcutsModal />);
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("shows all shortcut sections", () => {
    useSettingsStore.setState({ shortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("File Tree")).toBeInTheDocument();
  });

  it("shows keyboard shortcut descriptions", () => {
    useSettingsStore.setState({ shortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    expect(screen.getByText("Search notes")).toBeInTheDocument();
    expect(screen.getByText("Open settings")).toBeInTheDocument();
    expect(screen.getByText("Save note")).toBeInTheDocument();
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("Navigate files")).toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    useSettingsStore.setState({ shortcutsOpen: true });
    render(<KeyboardShortcutsModal />);

    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(useSettingsStore.getState().shortcutsOpen).toBe(false);
  });
});
