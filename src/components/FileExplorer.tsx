import {
  Search,
  FilePlus,
  FolderPlus,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useVaultStore } from "@/store/vaultStore";
import { useNoteStore } from "@/store/noteStore";
import type { FileEntry } from "@/types/note";

export function FileExplorer() {
  const { vaultPath, fileTree, refreshFiles } = useVaultStore();
  const {
    activeFilePath,
    searchQuery,
    openNote,
    createNote,
    deleteNote,
    createFolder,
    deleteFolder,
    setSearchQuery,
  } = useNoteStore();

  const handleNewNote = useCallback(
    (dirPath?: string) => {
      const dir = dirPath ?? vaultPath;
      if (!dir) return;

      let name = "Untitled";
      let counter = 1;
      const existsInTree = (entries: FileEntry[], n: string): boolean =>
        entries.some(
          (e) => !e.is_dir && (e.name === `${n}.md` || e.name === n),
        );

      const checkEntries = dirPath
        ? fileTree.find((e) => e.path === dirPath)?.children ?? fileTree
        : fileTree;

      while (existsInTree(checkEntries, name)) {
        name = `Untitled ${counter}`;
        counter++;
      }

      createNote(name, dir);
    },
    [vaultPath, fileTree, createNote],
  );

  const handleNewFolder = useCallback(() => {
    if (!vaultPath) return;
    let name = "New Folder";
    let counter = 1;
    while (fileTree.some((e) => e.is_dir && e.name === name)) {
      name = `New Folder ${counter}`;
      counter++;
    }
    createFolder(`${vaultPath}/${name}`);
  }, [vaultPath, fileTree, createFolder]);

  const filteredTree = filterTree(fileTree, searchQuery);
  const noteCount = countNotes(fileTree);
  const folderCount = fileTree.filter((e) => e.is_dir).length;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="flex items-center gap-1.5 rounded-md bg-[var(--color-bg-surface)] px-2.5 py-1.5">
          <Search size={14} className="shrink-0 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-transparent text-xs text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
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
          onClick={handleNewFolder}
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
      <nav className="flex-1 overflow-y-auto p-1.5">
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
            onOpenNote={openNote}
            onDeleteNote={deleteNote}
            onDeleteFolder={deleteFolder}
            onNewNote={handleNewNote}
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
    </div>
  );
}

function FileTreeNode({
  entry,
  activeFilePath,
  onOpenNote,
  onDeleteNote,
  onDeleteFolder,
  onNewNote,
  depth,
}: {
  entry: FileEntry;
  activeFilePath: string | null;
  onOpenNote: (path: string) => void;
  onDeleteNote: (path: string) => void;
  onDeleteFolder: (path: string) => void;
  onNewNote: (dirPath: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);

  if (entry.is_dir) {
    const children = entry.children ?? [];
    return (
      <div className="mb-0.5">
        <div
          className="group flex items-center gap-1 rounded-md px-2 py-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)]/50"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <button onClick={() => setOpen(!open)} className="shrink-0 text-[var(--color-text-muted)]">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Folder size={14} className="shrink-0 text-[var(--color-accent)]/70" />
          <span className="min-w-0 flex-1 truncate text-xs font-medium">
            {entry.name}
          </span>
          <span className="mr-1 text-[10px] text-[var(--color-text-muted)]">
            {children.filter((c) => !c.is_dir).length}
          </span>
          <button
            onClick={() => onDeleteFolder(entry.path)}
            className="shrink-0 rounded p-0.5 text-[var(--color-text-muted)] opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
            title="Delete folder"
          >
            <Trash2 size={12} />
          </button>
        </div>
        {open && (
          <div>
            {children.map((child) => (
              <FileTreeNode
                key={child.path}
                entry={child}
                activeFilePath={activeFilePath}
                onOpenNote={onOpenNote}
                onDeleteNote={onDeleteNote}
                onDeleteFolder={onDeleteFolder}
                onNewNote={onNewNote}
                depth={depth + 1}
              />
            ))}
            <button
              onClick={() => onNewNote(entry.path)}
              className="mt-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)]/30 hover:text-[var(--color-text-secondary)]"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              <FilePlus size={12} />
              <span>Add note</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const isActive = activeFilePath === entry.path;
  const displayName = entry.name.replace(/\.md$/, "");

  return (
    <button
      onClick={() => onOpenNote(entry.path)}
      className={`group mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors ${
        isActive
          ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/50"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <FileText size={14} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text-xs font-medium">
        {displayName}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteNote(entry.path);
        }}
        className="shrink-0 rounded p-0.5 text-[var(--color-text-muted)] opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </button>
  );
}

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
    if (entry.is_dir) {
      count += countNotes(entry.children ?? []);
    } else {
      count++;
    }
  }
  return count;
}
