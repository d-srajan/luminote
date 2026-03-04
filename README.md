# Luminote

An open-source, local-first note-taking app built with Tauri, React, and TypeScript. Designed as a fast, lightweight alternative to Obsidian with cloud sync capabilities.

![Luminote Screenshot](assets/screenshot.png)

## Vision

Luminote aims to be a modern note-taking tool that puts privacy and performance first:

- **Local-first** — Your notes live on your machine. No account required.
- **Markdown-native** — Write in Markdown with live preview.
- **Fast and lightweight** — Built with Tauri for a native-sized app (~10MB vs ~300MB Electron).
- **Cloud sync (planned)** — Optional sync across devices, end-to-end encrypted.
- **Extensible (planned)** — Plugin system for custom workflows.

## Tech Stack

| Layer       | Technology                  |
| ----------- | --------------------------- |
| Desktop     | Tauri 2                     |
| Frontend    | React 18+ / TypeScript      |
| Build       | Vite                        |
| Styling     | TailwindCSS 4               |
| State       | Zustand                     |
| Icons       | Lucide React                |
| Markdown    | react-markdown              |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Rust](https://rustup.rs/) (latest stable)
- Platform-specific Tauri dependencies — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/d-srajan/luminote.git
cd luminote

# Install dependencies
pnpm install

# Run in development mode (web only)
pnpm dev

# Run with Tauri (desktop app)
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Project Structure

```
luminote/
├── src/
│   ├── components/    # React UI components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand state management
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles + Tailwind
├── src-tauri/         # Tauri (Rust) backend
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json
```

## Roadmap

- [x] Basic editor with Markdown preview
- [ ] File-system backed note storage
- [ ] Full-text search
- [ ] Folder/tag organization
- [ ] Backlinks and graph view
- [ ] Cloud sync (E2E encrypted)
- [ ] Plugin system
- [ ] Vim keybindings
- [ ] Mobile companion app

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
