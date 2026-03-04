import { PanelLeft, PanelRight, Settings } from "lucide-react";
import { useLayoutStore } from "@/store/layoutStore";

export function Navbar() {
  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } =
    useLayoutStore();

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
        </div>
      </div>

      <div className="flex items-center gap-1">
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
          className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
