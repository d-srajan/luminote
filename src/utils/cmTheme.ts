import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const luminoteEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1e1e2e",
      color: "#cdd6f4",
      fontSize: "14px",
      fontFamily:
        '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace',
    },
    ".cm-content": {
      padding: "16px 0",
      caretColor: "#89b4fa",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#89b4fa",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "rgba(137, 180, 250, 0.2)",
      },
    ".cm-activeLine": {
      backgroundColor: "rgba(49, 50, 68, 0.4)",
    },
    ".cm-gutters": {
      backgroundColor: "#181825",
      color: "#6c7086",
      borderRight: "1px solid #45475a",
      paddingRight: "4px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "#cdd6f4",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 16px",
      minWidth: "3em",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "rgba(137, 180, 250, 0.3)",
      outline: "none",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(249, 226, 175, 0.3)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(249, 226, 175, 0.5)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#313244",
      color: "#a6adc8",
      border: "none",
      padding: "0 4px",
      borderRadius: "3px",
    },
    ".cm-tooltip": {
      backgroundColor: "#313244",
      color: "#cdd6f4",
      border: "1px solid #45475a",
      borderRadius: "6px",
    },
    ".cm-panels": {
      backgroundColor: "#181825",
      color: "#cdd6f4",
    },
  },
  { dark: true },
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

export const luminoteTheme = [
  luminoteEditorTheme,
  syntaxHighlighting(luminoteHighlightStyle),
];
