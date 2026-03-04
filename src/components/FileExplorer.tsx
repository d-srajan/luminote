import {
  Search,
  FilePlus,
  FolderPlus,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNoteStore } from "@/store/noteStore";
import { formatDate } from "@/utils/formatDate";

export function FileExplorer() {
  const {
    notes,
    folders,
    activeNoteId,
    searchQuery,
    addNote,
    addFolder,
    deleteNote,
    deleteFolder,
    toggleFolder,
    setActiveNote,
    setSearchQuery,
    getFilteredNotes,
  } = useNoteStore();

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const renameFolder = useNoteStore((s) => s.renameFolder);
  const filteredNotes = getFilteredNotes();

  const rootFolders = folders.filter((f) => f.parentId === null);
  const rootNotes = filteredNotes.filter((n) => n.folderId === null);

  function notesInFolder(folderId: string) {
    return filteredNotes.filter((n) => n.folderId === folderId);
  }

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
          onClick={() => addNote()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)]"
          title="New note"
        >
          <FilePlus size={14} />
          <span>Note</span>
        </button>
        <button
          onClick={() => addFolder()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)]"
          title="New folder"
        >
          <FolderPlus size={14} />
          <span>Folder</span>
        </button>
      </div>

      {/* File tree */}
      <nav className="flex-1 overflow-y-auto p-1.5">
        {rootFolders.length === 0 && rootNotes.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-[var(--color-text-muted)]">
            No notes yet.
            <br />
            Create one to get started!
          </p>
        )}

        {/* Folders */}
        {rootFolders.map((folder) => (
          <div key={folder.id} className="mb-0.5">
            <div className="group flex items-center gap-1 rounded-md px-2 py-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)]/50">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="shrink-0 text-[var(--color-text-muted)]"
              >
                {folder.isOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <Folder size={14} className="shrink-0 text-[var(--color-accent)]/70" />
              {editingFolderId === folder.id ? (
                <input
                  autoFocus
                  defaultValue={folder.name}
                  onBlur={(e) => {
                    renameFolder(folder.id, e.target.value || folder.name);
                    setEditingFolderId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameFolder(folder.id, e.currentTarget.value || folder.name);
                      setEditingFolderId(null);
                    }
                    if (e.key === "Escape") setEditingFolderId(null);
                  }}
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                />
              ) : (
                <span
                  className="min-w-0 flex-1 truncate text-xs font-medium"
                  onDoubleClick={() => setEditingFolderId(folder.id)}
                >
                  {folder.name}
                </span>
              )}
              <span className="mr-1 text-[10px] text-[var(--color-text-muted)]">
                {notesInFolder(folder.id).length}
              </span>
              <button
                onClick={() => deleteFolder(folder.id)}
                className="shrink-0 rounded p-0.5 text-[var(--color-text-muted)] opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                title="Delete folder"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Notes inside folder */}
            {folder.isOpen && (
              <div className="ml-4 border-l border-[var(--color-border)]/50 pl-1">
                {notesInFolder(folder.id).map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isActive={activeNoteId === note.id}
                    onSelect={() => setActiveNote(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
                <button
                  onClick={() => addNote(folder.id)}
                  className="mt-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)]/30 hover:text-[var(--color-text-secondary)]"
                >
                  <FilePlus size={12} />
                  <span>Add note</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Root-level notes */}
        {rootNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={activeNoteId === note.id}
            onSelect={() => setActiveNote(note.id)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-3 py-2">
        <p className="text-[10px] text-[var(--color-text-muted)]">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
          {folders.length > 0 && ` \u00B7 ${folders.length} folder${folders.length !== 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}

function NoteItem({
  note,
  isActive,
  onSelect,
  onDelete,
}: {
  note: { id: string; title: string; updatedAt: number };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors ${
        isActive
          ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/50"
      }`}
    >
      <FileText size={14} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{note.title}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">
          {formatDate(note.updatedAt)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 rounded p-0.5 text-[var(--color-text-muted)] opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </button>
  );
}
