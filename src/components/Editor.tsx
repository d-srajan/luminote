import { useState, useEffect, useRef, useMemo, memo, type ReactNode } from "react";
import { Eye, Edit3, FileText } from "lucide-react";
import Markdown from "react-markdown";
import { useNoteStore } from "@/store/noteStore";
import { useVaultStore } from "@/store/vaultStore";
import { resolveWikiLink, flattenFiles } from "@/utils/wikilinks";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, dropCursor } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import { luminoteTheme, wikiLinkDecorations, createEditorFontTheme } from "@/utils/cmTheme";
import { useSettingsStore } from "@/store/settingsStore";
import type { FileEntry } from "@/types/note";

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

// ─── WikiLink autocomplete ───

function wikiLinkCompletion(fileTree: FileEntry[]) {
  return (context: CompletionContext) => {
    const match = context.matchBefore(/\[\[([^\]]*)$/);
    if (!match) return null;

    const query = match.text.slice(2).toLowerCase();
    const notes = flattenFiles(fileTree);

    return {
      from: match.from,
      filter: false,
      options: notes
        .filter((n) => n.name.replace(/\.md$/, "").toLowerCase().includes(query))
        .map((n) => {
          const label = n.name.replace(/\.md$/, "");
          return {
            label,
            apply: `[[${label}]]`,
          };
        }),
    };
  };
}

// ─── WikiLink preview rendering ───

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function WikiLinkText({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate: (name: string) => void;
}) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  WIKILINK_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = WIKILINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const name = match[1]!.trim();
    const display = match[2]?.trim() || name;
    parts.push(
      <button
        key={`${match.index}-${name}`}
        onClick={() => onNavigate(name)}
        className="wikilink"
      >
        {display}
      </button>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

function processChildren(
  children: ReactNode,
  onNavigate: (name: string) => void,
): ReactNode {
  if (typeof children === "string") {
    if (children.includes("[[")) {
      return <WikiLinkText text={children} onNavigate={onNavigate} />;
    }
    return children;
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string" && child.includes("[[")) {
        return <WikiLinkText key={i} text={child} onNavigate={onNavigate} />;
      }
      return child;
    });
  }
  return children;
}

// ─── CodeMirror inner component ───

const CodeMirrorEditor = memo(function CodeMirrorEditor({
  content,
  filePath,
  fileTree,
  onContentChange,
  onSave,
  fontSize,
  fontFamily,
  lineHeight,
  showLineNumbers,
}: {
  content: string;
  filePath: string;
  fileTree: FileEntry[];
  onContentChange: (content: string) => void;
  onSave: () => void;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showLineNumbers: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const skipUpdateRef = useRef(false);

  const onContentChangeRef = useRef(onContentChange);
  const onSaveRef = useRef(onSave);
  const fileTreeRef = useRef(fileTree);
  onContentChangeRef.current = onContentChange;
  onSaveRef.current = onSave;
  fileTreeRef.current = fileTree;

  useEffect(() => {
    if (!editorRef.current) return;

    const customKeymap = keymap.of([
      { key: "Mod-s", run: () => { onSaveRef.current(); return true; } },
      { key: "Mod-b", run: (v) => wrapSelection(v, "**", "**") },
      { key: "Mod-i", run: (v) => wrapSelection(v, "*", "*") },
      { key: "Mod-k", run: (v) => insertLink(v) },
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !skipUpdateRef.current) {
        onContentChangeRef.current(update.state.doc.toString());
      }
    });

    const extensions = [
      customKeymap,
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
      createEditorFontTheme({ fontSize, fontFamily, lineHeight }),
      wikiLinkDecorations,
      autocompletion({
        override: [(ctx) => wikiLinkCompletion(fileTreeRef.current)(ctx)],
      }),
      updateListener,
    ];

    if (showLineNumbers) {
      extensions.splice(1, 0, lineNumbers());
    }

    const state = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  return <div ref={editorRef} className="h-full" />;
});

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
    openNote,
    createNote,
  } = useNoteStore();

  const { vaultPath, fileTree } = useVaultStore();
  const {
    editorFontSize,
    editorFontFamily,
    editorLineHeight,
    showLineNumbers,
    autoSaveInterval,
  } = useSettingsStore();
  const [preview, setPreview] = useState(false);

  // Auto-save after configured interval of inactivity
  useEffect(() => {
    if (!dirty || !activeFilePath) return;
    const timer = setTimeout(() => {
      saveActiveNote();
    }, autoSaveInterval);
    return () => clearTimeout(timer);
  }, [activeContent, dirty, activeFilePath, saveActiveNote, autoSaveInterval]);

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

  // WikiLink navigation handler
  const handleWikiLinkNavigate = (name: string) => {
    const resolved = resolveWikiLink(name, fileTree);
    if (resolved) {
      openNote(resolved);
    } else if (vaultPath) {
      const shouldCreate = window.confirm(
        `"${name}" doesn't exist yet. Create it?`,
      );
      if (shouldCreate) {
        createNote(name, vaultPath);
      }
    }
  };

  // react-markdown components with WikiLink support
  const markdownComponents = useMemo(
    () => ({
      p: ({ children }: { children?: ReactNode }) => (
        <p>{processChildren(children, handleWikiLinkNavigate)}</p>
      ),
      li: ({ children }: { children?: ReactNode }) => (
        <li>{processChildren(children, handleWikiLinkNavigate)}</li>
      ),
      h1: ({ children }: { children?: ReactNode }) => (
        <h1>{processChildren(children, handleWikiLinkNavigate)}</h1>
      ),
      h2: ({ children }: { children?: ReactNode }) => (
        <h2>{processChildren(children, handleWikiLinkNavigate)}</h2>
      ),
      h3: ({ children }: { children?: ReactNode }) => (
        <h3>{processChildren(children, handleWikiLinkNavigate)}</h3>
      ),
      td: ({ children }: { children?: ReactNode }) => (
        <td>{processChildren(children, handleWikiLinkNavigate)}</td>
      ),
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote>{processChildren(children, handleWikiLinkNavigate)}</blockquote>
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileTree, vaultPath],
  );

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
              <Markdown components={markdownComponents}>{activeContent}</Markdown>
            </article>
          </div>
        ) : (
          <CodeMirrorEditor
            key={`${activeFilePath}-${editorFontSize}-${editorFontFamily}-${editorLineHeight}-${showLineNumbers}`}
            content={activeContent}
            filePath={activeFilePath}
            fileTree={fileTree}
            onContentChange={updateContent}
            onSave={saveActiveNote}
            fontSize={editorFontSize}
            fontFamily={editorFontFamily}
            lineHeight={editorLineHeight}
            showLineNumbers={showLineNumbers}
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
