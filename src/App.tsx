import { Navbar } from "@/components/Navbar";
import { FileExplorer } from "@/components/FileExplorer";
import { Editor } from "@/components/Editor";
import { RightSidebar } from "@/components/RightSidebar";
import { ResizeHandle } from "@/components/ResizeHandle";
import { useLayoutStore } from "@/store/layoutStore";
import { useResize } from "@/hooks/useResize";

function App() {
  const {
    leftSidebarOpen,
    leftSidebarWidth,
    rightSidebarOpen,
    rightSidebarWidth,
    setLeftSidebarWidth,
    setRightSidebarWidth,
  } = useLayoutStore();

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

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar */}
        <aside
          className="shrink-0 overflow-hidden bg-[var(--color-bg-secondary)] transition-[width] duration-200 ease-in-out"
          style={{ width: leftSidebarOpen ? leftSidebarWidth : 0 }}
        >
          <div
            className="h-full"
            style={{ width: leftSidebarWidth }}
          >
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
          <div
            className="h-full"
            style={{ width: rightSidebarWidth }}
          >
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
