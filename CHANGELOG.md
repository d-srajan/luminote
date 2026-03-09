# Changelog

All notable changes to Luminote will be documented in this file.

## [0.1.0] - 2026-03-09

### Added

- **Three-panel resizable layout** — Left sidebar (file tree), center editor, right sidebar (preview), with draggable resize handles
- **CodeMirror 6 markdown editor** — Syntax highlighting, line numbers, bracket matching, history/undo, line wrapping
- **Markdown preview** — Live preview with react-markdown, toggle between edit and preview modes
- **WikiLink support** — `[[note]]` and `[[note|display]]` syntax with:
  - Autocomplete dropdown when typing `[[`
  - Syntax highlighting in the editor
  - Clickable links in preview mode
  - Navigation to linked notes (with prompt to create if missing)
- **File tree** — Hierarchical file/folder display with:
  - Create, rename, delete notes and folders
  - Drag and drop to move files between folders
  - Right-click context menus
  - Keyboard navigation (arrow keys, Enter, F2, Delete)
- **Note search** — Real-time filtering with:
  - Match highlighting in file names
  - Cmd/Ctrl+P keyboard shortcut to focus search
  - 150ms debounce for performance
  - Clear button and Escape to dismiss
- **Settings system** — Modal with tabbed interface:
  - General: Light/Dark/System theme toggle, auto-save interval
  - Editor: Font size (12-20px), font family, line height, line numbers toggle
  - About: Version, license, framework info
  - Persistent via localStorage
- **Theme support** — Light and dark themes using Catppuccin color palette (Mocha for dark, Latte for light), with system preference detection
- **Toast notifications** — Success/error notifications via sonner for all file operations
- **Keyboard shortcuts help** — Modal showing all shortcuts organized by category (General, Editor, File Tree)
- **Auto-save** — Configurable auto-save interval with dirty state indicator
- **Word/character count** — Live word and character count in editor footer
- **Browser mode** — In-memory filesystem fallback when running outside Tauri (for development/testing)

### Technical

- Tauri 2 desktop framework with Rust backend
- React 19 with TypeScript strict mode
- Vite 7 build tool with TailwindCSS 4
- Zustand state management with persist middleware
- Vitest + React Testing Library test setup
- GitHub Actions CI workflow
