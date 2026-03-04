import { useState, useEffect, useCallback } from "react";
import { Eye, Edit3, FileText, Save } from "lucide-react";
import Markdown from "react-markdown";
import { useNoteStore } from "@/store/noteStore";

export function Editor() {
  const {
    activeFilePath,
    activeContent,
    activeTitle,
    dirty,
    saving,
    updateContent,
    updateTitle,
    saveActiveNote,
  } = useNoteStore();
  const [preview, setPreview] = useState(false);

  // Auto-save on Ctrl+S / Cmd+S
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveActiveNote();
      }
    },
    [saveActiveNote],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Auto-save after 2s of inactivity
  useEffect(() => {
    if (!dirty || !activeFilePath) return;
    const timer = setTimeout(() => {
      saveActiveNote();
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeContent, dirty, activeFilePath, saveActiveNote]);

  if (!activeFilePath) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[var(--color-text-muted)]">
        <FileText size={48} strokeWidth={1} />
        <div className="text-center">
          <p className="text-sm font-medium">No note selected</p>
          <p className="mt-1 text-xs">
            Select a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title bar */}
      <header className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-2.5">
        <input
          type="text"
          value={activeTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="flex-1 bg-transparent text-lg font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          placeholder="Note title..."
        />
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={saveActiveNote}
              disabled={saving}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)]"
              title="Save (Ctrl+S)"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          )}
          <div className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-surface)] p-0.5">
            <button
              onClick={() => setPreview(false)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                !preview
                  ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                preview
                  ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {preview ? (
          <article className="prose prose-invert mx-auto max-w-3xl p-6 text-[var(--color-text-primary)]">
            <Markdown>{activeContent}</Markdown>
          </article>
        ) : (
          <textarea
            value={activeContent}
            onChange={(e) => updateContent(e.target.value)}
            className="h-full w-full resize-none bg-transparent p-6 font-mono text-sm leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            placeholder="Start writing in Markdown..."
          />
        )}
      </div>
    </div>
  );
}
