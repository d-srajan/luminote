import { create } from "zustand";
import type { Note, Folder } from "@/types/note";

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  searchQuery: string;

  addNote: (folderId?: string | null) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  getActiveNote: () => Note | undefined;
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];

  addFolder: (parentId?: string | null) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  folders: [],
  activeNoteId: null,
  searchQuery: "",

  addNote: (folderId = null) => {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      folderId,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      notes: [note, ...state.notes],
      activeNoteId: note.id,
    }));
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note,
      ),
    }));
  },

  deleteNote: (id) => {
    set((state) => {
      const remaining = state.notes.filter((n) => n.id !== id);
      return {
        notes: remaining,
        activeNoteId:
          state.activeNoteId === id
            ? (remaining[0]?.id ?? null)
            : state.activeNoteId,
      };
    });
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  getActiveNote: () => {
    const { notes, activeNoteId } = get();
    return notes.find((n) => n.id === activeNoteId);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  },

  addFolder: (parentId = null) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: "New Folder",
      parentId,
      isOpen: true,
    };
    set((state) => ({ folders: [...state.folders, folder] }));
  },

  renameFolder: (id, name) => {
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
  },

  deleteFolder: (id) => {
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      notes: state.notes.map((n) =>
        n.folderId === id ? { ...n, folderId: null } : n,
      ),
    }));
  },

  toggleFolder: (id) => {
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, isOpen: !f.isOpen } : f,
      ),
    }));
  },
}));
