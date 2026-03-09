import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

const isMac = navigator.platform.toUpperCase().includes("MAC");
const mod = isMac ? "⌘" : "Ctrl";

interface Shortcut {
  keys: string;
  description: string;
}

const SECTIONS: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: "General",
    shortcuts: [
      { keys: `${mod}P`, description: "Search notes" },
      { keys: `${mod},`, description: "Open settings" },
      { keys: "?", description: "Keyboard shortcuts" },
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      { keys: `${mod}S`, description: "Save note" },
      { keys: `${mod}B`, description: "Bold" },
      { keys: `${mod}I`, description: "Italic" },
      { keys: `${mod}K`, description: "Insert link" },
      { keys: `${mod}Z`, description: "Undo" },
      { keys: `${mod}${isMac ? "⇧Z" : "+Y"}`, description: "Redo" },
    ],
  },
  {
    title: "File Tree",
    shortcuts: [
      { keys: "↑ ↓", description: "Navigate files" },
      { keys: "← →", description: "Collapse / Expand folder" },
      { keys: "Enter", description: "Open file or toggle folder" },
      { keys: "F2", description: "Rename" },
      { keys: "Delete", description: "Delete" },
    ],
  },
];

export function KeyboardShortcutsModal() {
  const { shortcutsOpen, closeShortcuts } = useSettingsStore();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shortcutsOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeShortcuts();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcutsOpen, closeShortcuts]);

  if (!shortcutsOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) closeShortcuts();
      }}
    >
      <div className="flex w-[420px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={closeShortcuts}
            className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto p-5">
          <div className="flex flex-col gap-5">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {section.title}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {shortcut.description}
                      </span>
                      <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-primary)]">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
