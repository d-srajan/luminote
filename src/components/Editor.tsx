import { useState } from "react";
import { Eye, Edit3, FileText } from "lucide-react";
import Markdown from "react-markdown";
import { useNoteStore } from "@/store/noteStore";

export function Editor() {
  const { activeNoteId, getActiveNote, updateNote } = useNoteStore();
  const [preview, setPreview] = useState(false);
  const note = getActiveNote();

  if (!activeNoteId || !note) {
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
          value={note.title}
          onChange={(e) => updateNote(note.id, { title: e.target.value })}
          className="flex-1 bg-transparent text-lg font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          placeholder="Note title..."
        />
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
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {preview ? (
          <article className="prose prose-invert mx-auto max-w-3xl p-6 text-[var(--color-text-primary)]">
            <Markdown>{note.content}</Markdown>
          </article>
        ) : (
          <textarea
            value={note.content}
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
            className="h-full w-full resize-none bg-transparent p-6 font-mono text-sm leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            placeholder="Start writing in Markdown..."
          />
        )}
      </div>
    </div>
  );
}
