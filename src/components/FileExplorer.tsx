import {
  Search,
  FilePlus,
  FolderPlus,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Trash2,
  RefreshCw,
  Pencil,
  Copy,
  X,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useVaultStore } from "@/store/vaultStore";
import { useNoteStore } from "@/store/noteStore";
import { ContextMenu, type MenuItem } from "@/components/ContextMenu";
import type { FileEntry } from "@/types/note";

// ─── Flat index helpers ───

function flattenTree(entries: FileEntry[]): FileEntry[] {
  const result: FileEntry[] = [];
  for (const entry of entries) {
    result.push(entry);
    if (entry.is_dir && entry.children) {
      result.push(...flattenTree(entry.children));
    }
  }
  return result;
}

// ─── FileExplorer ───

export function FileExplorer() {
  const { vaultPath, fileTree, refreshFiles } = useVaultStore();
  const {
    activeFilePath,
    searchQuery,
    openNote,
    createNote,
    deleteNote,
    deleteFolder,
    renameNote,
    renameFolder,
    createFolder,
    moveFile,
    setSearchQuery,
  } = useNoteStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    entry: FileEntry | null;
  } | null>(null);

  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [focusedPath, setFocusedPath] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ─── Global Cmd/Ctrl+P shortcut ───
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Auto-expand all folders on first load
  useEffect(() => {
    const allFolders = new Set<string>();
    function walk(entries: FileEntry[]) {
      for (const e of entries) {
        if (e.is_dir) {
          allFolders.add(e.path);
          if (e.children) walk(e.children);
        }
      }
    }
    walk(fileTree);
    setOpenFolders((prev) => {
      const merged = new Set(prev);
      for (const p of allFolders) merged.add(p);
      return merged;
    });
  }, [fileTree]);

  const toggleFolder = useCallback((path: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleNewNote = useCallback(
    (dirPath?: string) => {
      const dir = dirPath ?? vaultPath;
      if (!dir) return;
      let name = "Untitled";
      let counter = 1;
      const siblings = dirPath
        ? flattenTree(fileTree).find((e) => e.path === dirPath)?.children ?? []
        : fileTree;
      while (siblings.some((e) => !e.is_dir && (e.name === `${name}.md` || e.name === name))) {
        name = `Untitled ${counter}`;
        counter++;
      }
      createNote(name, dir);
    },
    [vaultPath, fileTree, createNote],
  );

  const handleNewFolder = useCallback(
    (parentDir?: string) => {
      const dir = parentDir ?? vaultPath;
      if (!dir) return;
      const siblings = parentDir
        ? flattenTree(fileTree).find((e) => e.path === parentDir)?.children ?? []
        : fileTree;
      let name = "New Folder";
      let counter = 1;
      while (siblings.some((e) => e.is_dir && e.name === name)) {
        name = `New Folder ${counter}`;
        counter++;
      }
      createFolder(`${dir}/${name}`);
    },
    [vaultPath, fileTree, createFolder],
  );

  const handleRename = useCallback(
    (entry: FileEntry, newName: string) => {
      if (!newName.trim() || newName === entry.name.replace(/\.md$/, "")) {
        setRenamingPath(null);
        return;
      }
      if (entry.is_dir) {
        renameFolder(entry.path, newName);
      } else {
        renameNote(entry.path, newName);
      }
      setRenamingPath(null);
    },
    [renameNote, renameFolder],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, entry: FileEntry | null) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, entry });
    },
    [],
  );

  const copyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path);
  }, []);

  // ─── Build context menu items ───

  function buildMenuItems(entry: FileEntry | null): MenuItem[] {
    if (!entry) {
      return [
        { label: "New Note", icon: FilePlus, onClick: () => handleNewNote() },
        { label: "New Folder", icon: FolderPlus, onClick: () => handleNewFolder() },
      ];
    }
    if (entry.is_dir) {
      return [
        { label: "New Note", icon: FilePlus, onClick: () => handleNewNote(entry.path) },
        { label: "New Folder", icon: FolderPlus, onClick: () => handleNewFolder(entry.path) },
        { label: "", separator: true, onClick: () => {} },
        { label: "Rename", icon: Pencil, onClick: () => setRenamingPath(entry.path) },
        { label: "Copy Path", icon: Copy, onClick: () => copyPath(entry.path) },
        { label: "", separator: true, onClick: () => {} },
        { label: "Delete", icon: Trash2, danger: true, onClick: () => deleteFolder(entry.path) },
      ];
    }
    return [
      { label: "Rename", icon: Pencil, shortcut: "F2", onClick: () => setRenamingPath(entry.path) },
      { label: "Copy Path", icon: Copy, onClick: () => copyPath(entry.path) },
      { label: "", separator: true, onClick: () => {} },
      { label: "Delete", icon: Trash2, danger: true, shortcut: "Del", onClick: () => deleteNote(entry.path) },
    ];
  }

  // ─── Keyboard navigation ───

  const filteredTree = filterTree(fileTree, searchQuery);
  const visibleEntries = getVisibleEntries(filteredTree, openFolders);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!visibleEntries.length) return;
      const idx = focusedPath ? visibleEntries.findIndex((v) => v.path === focusedPath) : -1;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = Math.min(idx + 1, visibleEntries.length - 1);
          setFocusedPath(visibleEntries[next]?.path ?? null);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = Math.max(idx - 1, 0);
          setFocusedPath(visibleEntries[prev]?.path ?? null);
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const entry = visibleEntries[idx];
          if (entry?.is_dir && !openFolders.has(entry.path)) {
            toggleFolder(entry.path);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const entry = visibleEntries[idx];
          if (entry?.is_dir && openFolders.has(entry.path)) {
            toggleFolder(entry.path);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          const entry = visibleEntries[idx];
          if (!entry) break;
          if (entry.is_dir) {
            toggleFolder(entry.path);
          } else {
            openNote(entry.path);
          }
          break;
        }
        case "F2": {
          e.preventDefault();
          if (focusedPath) setRenamingPath(focusedPath);
          break;
        }
        case "Delete": {
          e.preventDefault();
          const entry = visibleEntries[idx];
          if (!entry) break;
          if (entry.is_dir) deleteFolder(entry.path);
          else deleteNote(entry.path);
          break;
        }
      }
    },
    [visibleEntries, focusedPath, openFolders, openNote, toggleFolder, deleteNote, deleteFolder],
  );

  // ─── Drag and drop handlers ───

  const handleDragStart = useCallback((e: React.DragEvent, entry: FileEntry) => {
    e.dataTransfer.setData("text/plain", entry.path);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, entry: FileEntry) => {
    if (!entry.is_dir) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverPath(entry.path);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverPath(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetDir: FileEntry) => {
      e.preventDefault();
      setDragOverPath(null);
      const sourcePath = e.dataTransfer.getData("text/plain");
      if (!sourcePath || sourcePath === targetDir.path) return;
      // Don't drop into itself
      if (sourcePath.startsWith(targetDir.path + "/")) return;
      moveFile(sourcePath, targetDir.path);
    },
    [moveFile],
  );

  const handleDropOnRoot = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverPath(null);
      const sourcePath = e.dataTransfer.getData("text/plain");
      if (!sourcePath || !vaultPath) return;
      moveFile(sourcePath, vaultPath);
    },
    [moveFile, vaultPath],
  );

  const noteCount = countNotes(fileTree);
  const folderCount = fileTree.filter((e) => e.is_dir).length;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="flex items-center gap-1.5 rounded-md bg-[var(--color-bg-surface)] px-2.5 py-1.5">
          <Search size={14} className="shrink-0 text-[var(--color-text-muted)]" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                searchRef.current?.blur();
                navRef.current?.focus();
              }
            }}
            placeholder="Search notes…  ⌘P"
            className="w-full bg-transparent text-xs text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchRef.current?.focus();
              }}
              className="shrink-0 rounded-sm p-0.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-secondary)]"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)] px-3 pb-2">
        <button
          onClick={() => handleNewNote()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)]"
          title="New note"
        >
          <FilePlus size={14} />
          <span>Note</span>
        </button>
        <button
          onClick={() => handleNewFolder()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)]"
          title="New folder"
        >
          <FolderPlus size={14} />
          <span>Folder</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={refreshFiles}
          className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"
          title="Refresh"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* File tree */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto p-1.5 focus:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => handleContextMenu(e, null)}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={handleDropOnRoot}
      >
        {filteredTree.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-[var(--color-text-muted)]">
            {searchQuery ? "No matching notes." : "No notes yet.\nCreate one to get started!"}
          </p>
        )}

        {filteredTree.map((entry) => (
          <FileTreeNode
            key={entry.path}
            entry={entry}
            activeFilePath={activeFilePath}
            focusedPath={focusedPath}
            renamingPath={renamingPath}
            openFolders={openFolders}
            dragOverPath={dragOverPath}
            searchQuery={searchQuery}
            onOpenNote={openNote}
            onToggleFolder={toggleFolder}
            onContextMenu={handleContextMenu}
            onRename={handleRename}
            onCancelRename={() => setRenamingPath(null)}
            onFocus={setFocusedPath}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            depth={0}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-3 py-2">
        <p className="text-[10px] text-[var(--color-text-muted)]">
          {noteCount} note{noteCount !== 1 ? "s" : ""}
          {folderCount > 0 && ` \u00B7 ${folderCount} folder${folderCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildMenuItems(contextMenu.entry)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

// ─── Inline rename input ───

function InlineRename({
  defaultValue,
  onSubmit,
  onCancel,
}: {
  defaultValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    // Select filename without extension
    const dotIdx = defaultValue.lastIndexOf(".");
    el.setSelectionRange(0, dotIdx > 0 ? dotIdx : defaultValue.length);
  }, [defaultValue]);

  return (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
      className="min-w-0 flex-1 rounded-sm bg-[var(--color-bg-surface)] px-1 text-xs text-[var(--color-text-primary)] outline-none ring-1 ring-[var(--color-accent)]"
      onBlur={(e) => onSubmit(e.target.value.replace(/\.md$/, ""))}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSubmit(e.currentTarget.value.replace(/\.md$/, ""));
        }
        if (e.key === "Escape") onCancel();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// ─── FileTreeNode ───

interface TreeNodeProps {
  entry: FileEntry;
  activeFilePath: string | null;
  focusedPath: string | null;
  renamingPath: string | null;
  openFolders: Set<string>;
  dragOverPath: string | null;
  searchQuery: string;
  onOpenNote: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, entry: FileEntry) => void;
  onRename: (entry: FileEntry, newName: string) => void;
  onCancelRename: () => void;
  onFocus: (path: string) => void;
  onDragStart: (e: React.DragEvent, entry: FileEntry) => void;
  onDragOver: (e: React.DragEvent, entry: FileEntry) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, entry: FileEntry) => void;
  depth: number;
}

function FileTreeNode({
  entry,
  activeFilePath,
  focusedPath,
  renamingPath,
  openFolders,
  dragOverPath,
  searchQuery,
  onOpenNote,
  onToggleFolder,
  onContextMenu,
  onRename,
  onCancelRename,
  onFocus,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  depth,
}: TreeNodeProps) {
  const isRenaming = renamingPath === entry.path;
  const isFocused = focusedPath === entry.path;
  const paddingLeft = depth * 14 + 8;

  if (entry.is_dir) {
    const isOpen = openFolders.has(entry.path);
    const children = entry.children ?? [];
    const isDragOver = dragOverPath === entry.path;
    const FolderIcon = isOpen ? FolderOpen : Folder;

    return (
      <div className="mb-px">
        <div
          className={`group flex cursor-pointer items-center gap-1 rounded-md px-2 py-[5px] transition-colors ${
            isFocused
              ? "bg-[var(--color-bg-surface)]/70 text-[var(--color-text-primary)]"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/40"
          } ${isDragOver ? "ring-1 ring-[var(--color-accent)] bg-[var(--color-accent)]/5" : ""}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => onToggleFolder(entry.path)}
          onContextMenu={(e) => onContextMenu(e, entry)}
          onMouseDown={() => onFocus(entry.path)}
          onDragOver={(e) => onDragOver(e, entry)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, entry)}
        >
          <span className="shrink-0 text-[var(--color-text-muted)]">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <FolderIcon size={14} className="shrink-0 text-[var(--color-accent)]/70" />
          {isRenaming ? (
            <InlineRename
              defaultValue={entry.name}
              onSubmit={(val) => onRename(entry, val)}
              onCancel={onCancelRename}
            />
          ) : (
            <span className="min-w-0 flex-1 truncate text-xs font-medium">
              <HighlightMatch text={entry.name} query={searchQuery} />
            </span>
          )}
          <span className="mr-0.5 text-[10px] text-[var(--color-text-muted)]">
            {children.filter((c) => !c.is_dir).length}
          </span>
        </div>
        {isOpen && (
          <div>
            {children.map((child) => (
              <FileTreeNode
                key={child.path}
                entry={child}
                activeFilePath={activeFilePath}
                focusedPath={focusedPath}
                renamingPath={renamingPath}
                openFolders={openFolders}
                dragOverPath={dragOverPath}
                searchQuery={searchQuery}
                onOpenNote={onOpenNote}
                onToggleFolder={onToggleFolder}
                onContextMenu={onContextMenu}
                onRename={onRename}
                onCancelRename={onCancelRename}
                onFocus={onFocus}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File node
  const isActive = activeFilePath === entry.path;
  const displayName = entry.name.replace(/\.md$/, "");

  return (
    <div
      className={`group mb-px flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-[5px] text-left transition-colors ${
        isActive
          ? "bg-[var(--color-accent)]/15 text-[var(--color-text-primary)]"
          : isFocused
            ? "bg-[var(--color-bg-surface)]/70 text-[var(--color-text-primary)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/40"
      }`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      draggable
      onClick={() => onOpenNote(entry.path)}
      onContextMenu={(e) => onContextMenu(e, entry)}
      onMouseDown={() => onFocus(entry.path)}
      onDragStart={(e) => onDragStart(e, entry)}
    >
      <FileText size={14} className={`shrink-0 ${isActive ? "text-[var(--color-accent)]" : ""}`} />
      {isRenaming ? (
        <InlineRename
          defaultValue={entry.name}
          onSubmit={(val) => onRename(entry, val)}
          onCancel={onCancelRename}
        />
      ) : (
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          <HighlightMatch text={displayName} query={searchQuery} />
        </span>
      )}
    </div>
  );
}

// ─── Highlight match ───

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm bg-[var(--color-accent)]/25 text-[var(--color-accent)] px-px"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ─── Helpers ───

function filterTree(entries: FileEntry[], query: string): FileEntry[] {
  if (!query.trim()) return entries;
  const q = query.toLowerCase();
  return entries
    .map((entry) => {
      if (entry.is_dir) {
        const filteredChildren = filterTree(entry.children ?? [], q);
        if (filteredChildren.length > 0) {
          return { ...entry, children: filteredChildren };
        }
        return null;
      }
      return entry.name.toLowerCase().includes(q) ? entry : null;
    })
    .filter((e): e is FileEntry => e !== null);
}

function countNotes(entries: FileEntry[]): number {
  let count = 0;
  for (const entry of entries) {
    if (entry.is_dir) count += countNotes(entry.children ?? []);
    else count++;
  }
  return count;
}

function getVisibleEntries(entries: FileEntry[], openFolders: Set<string>): FileEntry[] {
  const result: FileEntry[] = [];
  for (const entry of entries) {
    result.push(entry);
    if (entry.is_dir && openFolders.has(entry.path) && entry.children) {
      result.push(...getVisibleEntries(entry.children, openFolders));
    }
  }
  return result;
}
