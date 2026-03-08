import { EditorView, ViewPlugin, Decoration, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { RangeSetBuilder } from "@codemirror/state";
import type { Extension } from "@codemirror/state";

// ─── Configurable theme ───

export interface EditorThemeOptions {
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
}

export function createEditorFontTheme(opts: EditorThemeOptions): Extension {
  return EditorView.theme({
    "&": {
      fontSize: `${opts.fontSize ?? 14}px`,
      fontFamily:
        opts.fontFamily ??
        '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace',
    },
    ".cm-content": {
      lineHeight: String(opts.lineHeight ?? 1.6),
    },
  });
}

const luminoteEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--color-bg-primary)",
      color: "var(--color-text-primary)",
      fontSize: "14px",
      fontFamily:
        '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace',
    },
    ".cm-content": {
      padding: "16px 0",
      caretColor: "var(--color-accent)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--color-accent)",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "color-mix(in srgb, var(--color-accent) 20%, transparent)",
      },
    ".cm-activeLine": {
      backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 40%, transparent)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--color-bg-secondary)",
      color: "var(--color-text-muted)",
      borderRight: "1px solid var(--color-border)",
      paddingRight: "4px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "var(--color-text-primary)",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 16px",
      minWidth: "3em",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "color-mix(in srgb, var(--color-accent) 30%, transparent)",
      outline: "none",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(249, 226, 175, 0.3)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(249, 226, 175, 0.5)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--color-bg-surface)",
      color: "var(--color-text-secondary)",
      border: "none",
      padding: "0 4px",
      borderRadius: "3px",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--color-bg-surface)",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
    },
    ".cm-tooltip-autocomplete": {
      backgroundColor: "var(--color-bg-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
      padding: "4px 0",
    },
    ".cm-tooltip-autocomplete ul li": {
      padding: "4px 12px",
      fontSize: "13px",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
      color: "var(--color-text-primary)",
    },
    ".cm-wikilink": {
      color: "var(--color-accent)",
      textDecoration: "underline",
      textDecorationStyle: "dotted",
      textUnderlineOffset: "2px",
    },
    ".cm-panels": {
      backgroundColor: "var(--color-bg-secondary)",
      color: "var(--color-text-primary)",
    },
  },
);

const luminoteHighlightStyle = HighlightStyle.define([
  // Headings
  { tag: tags.heading1, color: "#89b4fa", fontWeight: "bold", fontSize: "1.4em" },
  { tag: tags.heading2, color: "#89b4fa", fontWeight: "bold", fontSize: "1.25em" },
  { tag: tags.heading3, color: "#89b4fa", fontWeight: "bold", fontSize: "1.1em" },
  { tag: tags.heading4, color: "#89b4fa", fontWeight: "bold" },
  { tag: tags.heading5, color: "#89b4fa", fontWeight: "bold" },
  { tag: tags.heading6, color: "#89b4fa", fontWeight: "bold" },

  // Emphasis
  { tag: tags.emphasis, color: "#f5c2e7", fontStyle: "italic" },
  { tag: tags.strong, color: "#fab387", fontWeight: "bold" },
  { tag: tags.strikethrough, textDecoration: "line-through", color: "#6c7086" },

  // Links
  { tag: tags.link, color: "#89b4fa", textDecoration: "underline" },
  { tag: tags.url, color: "#6c7086" },

  // Code
  {
    tag: tags.monospace,
    color: "#a6e3a1",
    backgroundColor: "rgba(49, 50, 68, 0.6)",
    borderRadius: "3px",
  },

  // Quotes
  { tag: tags.quote, color: "#6c7086", fontStyle: "italic" },

  // Lists
  { tag: tags.list, color: "#89b4fa" },

  // Processing instructions (markdown markers like #, *, -, etc.)
  { tag: tags.processingInstruction, color: "#6c7086" },
  { tag: tags.contentSeparator, color: "#45475a" },

  // Meta (front matter, etc.)
  { tag: tags.meta, color: "#6c7086" },

  // Comments
  { tag: tags.comment, color: "#6c7086", fontStyle: "italic" },

  // Strings and numbers (for code blocks)
  { tag: tags.string, color: "#a6e3a1" },
  { tag: tags.number, color: "#fab387" },
  { tag: tags.bool, color: "#fab387" },
  { tag: tags.keyword, color: "#cba6f7" },
  { tag: tags.operator, color: "#89dceb" },
  { tag: tags.variableName, color: "#cdd6f4" },
  { tag: tags.function(tags.variableName), color: "#89b4fa" },
  { tag: tags.typeName, color: "#f9e2af" },
  { tag: tags.propertyName, color: "#89b4fa" },
  { tag: tags.definition(tags.variableName), color: "#89b4fa" },
]);

// ─── WikiLink decorations ───

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const wikiLinkMark = Decoration.mark({ class: "cm-wikilink" });

function buildWikiLinkDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.sliceDoc(from, to);
    WIKILINK_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = WIKILINK_RE.exec(text)) !== null) {
      builder.add(from + match.index, from + match.index + match[0].length, wikiLinkMark);
    }
  }
  return builder.finish();
}

export const wikiLinkDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildWikiLinkDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildWikiLinkDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

export const luminoteTheme = [
  luminoteEditorTheme,
  syntaxHighlighting(luminoteHighlightStyle),
];
