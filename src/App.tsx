import { useEffect } from "react";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { FileExplorer } from "@/components/FileExplorer";
import { Editor } from "@/components/Editor";
import { RightSidebar } from "@/components/RightSidebar";
import { ResizeHandle } from "@/components/ResizeHandle";
import { VaultPicker } from "@/components/VaultPicker";
import { SettingsModal } from "@/components/SettingsModal";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { useLayoutStore } from "@/store/layoutStore";
import { useVaultStore } from "@/store/vaultStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useResize } from "@/hooks/useResize";
import { fs } from "@/utils/fs";

function App() {
  const {
    leftSidebarOpen,
    leftSidebarWidth,
    rightSidebarOpen,
    rightSidebarWidth,
    setLeftSidebarWidth,
    setRightSidebarWidth,
  } = useLayoutStore();

  const { vaultPath, loadVault } = useVaultStore();
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const theme = useSettingsStore((s) => s.theme);

  // Apply theme to document
  useEffect(() => {
    const resolved = resolvedTheme();
    document.documentElement.setAttribute("data-theme", resolved);

    // Listen for system theme changes when set to "system"
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        document.documentElement.setAttribute(
          "data-theme",
          mq.matches ? "dark" : "light",
        );
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, resolvedTheme]);

  // Auto-load saved vault on startup
  useEffect(() => {
    const saved = fs.getSavedVaultPath();
    if (saved) {
      loadVault(saved);
    }
  }, [loadVault]);

  const leftResize = useResize({
    direction: "left",
    onResize: setLeftSidebarWidth,
    initialWidth: leftSidebarWidth,
  });

  const rightResize = useResize({
    direction: "right",
    onResize: setRightSidebarWidth,
    initialWidth: rightSidebarWidth,
  });

  if (!vaultPath) {
    return <VaultPicker />;
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <Toaster
        position="top-right"
        theme={resolvedTheme() as "light" | "dark"}
        toastOptions={{ duration: 4000 }}
        richColors
      />
      <Navbar />

      <div className="flex min-h-0 flex-1">
        {/* Left sidebar */}
        <aside
          className="shrink-0 overflow-hidden bg-[var(--color-bg-secondary)] transition-[width] duration-200 ease-in-out"
          style={{ width: leftSidebarOpen ? leftSidebarWidth : 0 }}
        >
          <div className="h-full" style={{ width: leftSidebarWidth }}>
            <FileExplorer />
          </div>
        </aside>

        {leftSidebarOpen && (
          <ResizeHandle onMouseDown={leftResize.startResize} />
        )}

        {/* Center editor */}
        <main className="flex min-w-0 flex-1 flex-col bg-[var(--color-bg-primary)]">
          <Editor />
        </main>

        {rightSidebarOpen && (
          <ResizeHandle onMouseDown={rightResize.startResize} />
        )}

        {/* Right sidebar */}
        <aside
          className="shrink-0 overflow-hidden bg-[var(--color-bg-secondary)] transition-[width] duration-200 ease-in-out"
          style={{ width: rightSidebarOpen ? rightSidebarWidth : 0 }}
        >
          <div className="h-full" style={{ width: rightSidebarWidth }}>
            <RightSidebar />
          </div>
        </aside>
      </div>

      <SettingsModal />
      <KeyboardShortcutsModal />
    </div>
  );
}

export default App;
