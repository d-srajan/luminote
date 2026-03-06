import { useState, useEffect, useRef, useMemo } from "react";
import { Eye, Edit3, FileText } from "lucide-react";
import Markdown from "react-markdown";
import { useNoteStore } from "@/store/noteStore";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, dropCursor } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import { luminoteTheme } from "@/utils/cmTheme";

// ─── Markdown formatting helpers ───

function wrapSelection(view: EditorView, before: string, after: string) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  view.dispatch({
    changes: { from, to, insert: `${before}${selected}${after}` },
    selection: {
      anchor: from + before.length,
      head: to + before.length,
    },
  });
  return true;
}

function insertLink(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  if (selected) {
    const insert = `[${selected}](url)`;
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + selected.length + 3, head: from + selected.length + 6 },
    });
  } else {
    const insert = "[text](url)";
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + 1, head: from + 5 },
    });
  }
  return true;
}

// ─── CodeMirror inner component ───
// Only mounted when activeFilePath is set, so the ref is always available.

function CodeMirrorEditor({
  content,
  filePath,
  onContentChange,
  onSave,
}: {
  content: string;
  filePath: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const skipUpdateRef = useRef(false);

  // Stable refs for callbacks
  const onContentChangeRef = useRef(onContentChange);
  const onSaveRef = useRef(onSave);
  onContentChangeRef.current = onContentChange;
  onSaveRef.current = onSave;

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    const customKeymap = keymap.of([
      {
        key: "Mod-s",
        run: () => { onSaveRef.current(); return true; },
      },
      {
        key: "Mod-b",
        run: (v) => wrapSelection(v, "**", "**"),
      },
      {
        key: "Mod-i",
        run: (v) => wrapSelection(v, "*", "*"),
      },
      {
        key: "Mod-k",
        run: (v) => insertLink(v),
      },
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !skipUpdateRef.current) {
        onContentChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        customKeymap,
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        dropCursor(),
        history(),
        bracketMatching(),
        indentOnInput(),
        markdown(),
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        ...luminoteTheme,
        updateListener,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Re-create when component mounts (content is initial doc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync content when switching to a different note
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== content) {
      skipUpdateRef.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
      skipUpdateRef.current = false;
    }
    // Only sync when the file path changes (new note opened)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  return <div ref={editorRef} className="h-full" />;
}

// ─── Main Editor component ───

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

  // Auto-save after 2s of inactivity
  useEffect(() => {
    if (!dirty || !activeFilePath) return;
    const timer = setTimeout(() => {
      saveActiveNote();
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeContent, dirty, activeFilePath, saveActiveNote]);

  // Word & character counts
  const { words, chars } = useMemo(() => {
    const trimmed = activeContent.trim();
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      chars: activeContent.length,
    };
  }, [activeContent]);

  // Save status
  const saveStatus = saving ? "Saving..." : dirty ? "Unsaved" : "Saved";
  const statusColor = saving
    ? "text-[var(--color-text-muted)]"
    : dirty
      ? "text-amber-400"
      : "text-emerald-400";

  // Empty state
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
        <div className="flex items-center gap-3">
          {/* Save status */}
          <span className={`flex items-center gap-1.5 text-xs ${statusColor}`}>
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                saving
                  ? "animate-pulse bg-[var(--color-text-muted)]"
                  : dirty
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
            />
            {saveStatus}
          </span>

          {/* Edit / Preview toggle */}
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
      <div className="relative flex-1 overflow-hidden">
        {preview ? (
          <div className="h-full overflow-y-auto">
            <article className="prose prose-invert mx-auto max-w-3xl p-6 text-[var(--color-text-primary)]">
              <Markdown>{activeContent}</Markdown>
            </article>
          </div>
        ) : (
          <CodeMirrorEditor
            key={activeFilePath}
            content={activeContent}
            filePath={activeFilePath}
            onContentChange={updateContent}
            onSave={saveActiveNote}
          />
        )}
      </div>

      {/* Footer bar */}
      {!preview && (
        <div className="flex items-center justify-end border-t border-[var(--color-border)] px-4 py-1.5">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {words} word{words !== 1 ? "s" : ""} · {chars} character
            {chars !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
