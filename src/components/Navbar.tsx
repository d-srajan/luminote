import { useEffect } from "react";
import { PanelLeft, PanelRight, Settings, FolderOpen } from "lucide-react";
import { useLayoutStore } from "@/store/layoutStore";
import { useVaultStore } from "@/store/vaultStore";
import { useSettingsStore } from "@/store/settingsStore";

export function Navbar() {
  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } =
    useLayoutStore();
  const { vaultPath, openVault } = useVaultStore();
  const openSettings = useSettingsStore((s) => s.openSettings);

  // Global Cmd/Ctrl+, shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        openSettings();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openSettings]);

  const vaultName = vaultPath?.split(/[\\/]/).pop() ?? "";

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLeftSidebar}
          className={`rounded-md p-1.5 transition-colors hover:bg-[var(--color-bg-surface)] ${
            leftSidebarOpen
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)]"
          }`}
          title="Toggle file explorer"
        >
          <PanelLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 pl-1">
          <span className="text-sm font-bold tracking-wide text-[var(--color-accent)]">
            Luminote
          </span>
          {vaultName && (
            <span className="text-xs text-[var(--color-text-muted)]">
              / {vaultName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={openVault}
          className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          title="Open vault"
        >
          <FolderOpen size={18} />
        </button>
        <button
          onClick={toggleRightSidebar}
          className={`rounded-md p-1.5 transition-colors hover:bg-[var(--color-bg-surface)] ${
            rightSidebarOpen
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)]"
          }`}
          title="Toggle right panel"
        >
          <PanelRight size={18} />
        </button>
        <button
          onClick={() => openSettings()}
          className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          title="Settings (⌘,)"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
