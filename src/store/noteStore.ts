import { create } from "zustand";
import { fs } from "@/utils/fs";
import { useVaultStore } from "@/store/vaultStore";

interface NoteState {
  activeFilePath: string | null;
  activeContent: string;
  activeTitle: string;
  dirty: boolean;
  saving: boolean;
  searchQuery: string;
  error: string | null;

  openNote: (path: string) => Promise<void>;
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  saveActiveNote: () => Promise<void>;
  createNote: (name: string, dirPath: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
  renameNote: (oldPath: string, newName: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteFolder: (path: string) => Promise<void>;
  renameFolder: (oldPath: string, newName: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  closeNote: () => void;
}

function fileNameFromPath(path: string): string {
  const parts = path.split(/[\\/]/);
  const name = parts[parts.length - 1] ?? "";
  return name.replace(/\.md$/, "");
}

function parentDir(path: string): string {
  const parts = path.split(/[\\/]/);
  parts.pop();
  return parts.join("/");
}

export const useNoteStore = create<NoteState>((set, get) => ({
  activeFilePath: null,
  activeContent: "",
  activeTitle: "",
  dirty: false,
  saving: false,
  searchQuery: "",
  error: null,

  openNote: async (path) => {
    // Auto-save current note if dirty
    const { dirty } = get();
    if (dirty) {
      await get().saveActiveNote();
    }

    try {
      const content = await fs.readNote(path);
      set({
        activeFilePath: path,
        activeContent: content,
        activeTitle: fileNameFromPath(path),
        dirty: false,
        error: null,
      });
    } catch (e) {
      set({ error: `Failed to open note: ${e}` });
    }
  },

  updateContent: (content) => {
    set({ activeContent: content, dirty: true });
  },

  updateTitle: (title) => {
    set({ activeTitle: title, dirty: true });
  },

  saveActiveNote: async () => {
    const { activeFilePath, activeContent, activeTitle, saving } = get();
    if (!activeFilePath || saving) return;

    set({ saving: true });
    try {
      // Handle rename if title changed
      const currentName = fileNameFromPath(activeFilePath);
      let savePath = activeFilePath;

      if (activeTitle && activeTitle !== currentName) {
        const dir = parentDir(activeFilePath);
        const newPath = `${dir}/${activeTitle}.md`;
        await fs.renameNote(activeFilePath, newPath);
        savePath = newPath;
      }

      await fs.saveNote(savePath, activeContent);
      set({ activeFilePath: savePath, dirty: false, saving: false });
      useVaultStore.getState().refreshFiles();
    } catch (e) {
      set({ error: `Failed to save: ${e}`, saving: false });
    }
  },

  createNote: async (name, dirPath) => {
    try {
      const newPath = await fs.createNote(name, dirPath);
      await useVaultStore.getState().refreshFiles();
      await get().openNote(newPath);
    } catch (e) {
      set({ error: `Failed to create note: ${e}` });
    }
  },

  deleteNote: async (path) => {
    try {
      await fs.deleteNote(path);
      const { activeFilePath } = get();
      if (activeFilePath === path) {
        set({ activeFilePath: null, activeContent: "", activeTitle: "", dirty: false });
      }
      useVaultStore.getState().refreshFiles();
    } catch (e) {
      set({ error: `Failed to delete note: ${e}` });
    }
  },

  renameNote: async (oldPath, newName) => {
    try {
      const dir = parentDir(oldPath);
      const newPath = `${dir}/${newName}.md`;
      await fs.renameNote(oldPath, newPath);
      const { activeFilePath } = get();
      if (activeFilePath === oldPath) {
        set({ activeFilePath: newPath, activeTitle: newName });
      }
      useVaultStore.getState().refreshFiles();
    } catch (e) {
      set({ error: `Failed to rename note: ${e}` });
    }
  },

  createFolder: async (path) => {
    try {
      await fs.createFolder(path);
      useVaultStore.getState().refreshFiles();
    } catch (e) {
      set({ error: `Failed to create folder: ${e}` });
    }
  },

  deleteFolder: async (path) => {
    try {
      await fs.deleteFolder(path);
      useVaultStore.getState().refreshFiles();
    } catch (e) {
      set({ error: `Failed to delete folder: ${e}` });
    }
  },

  renameFolder: async (oldPath, newName) => {
    try {
      const dir = parentDir(oldPath);
      const newPath = `${dir}/${newName}`;
      await fs.renameFolder(oldPath, newPath);
      useVaultStore.getState().refreshFiles();
    } catch (e) {
      set({ error: `Failed to rename folder: ${e}` });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
  closeNote: () => set({ activeFilePath: null, activeContent: "", activeTitle: "", dirty: false }),
}));
