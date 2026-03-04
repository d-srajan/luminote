import { create } from "zustand";
import { fs } from "@/utils/fs";
import type { FileEntry } from "@/types/note";

interface VaultStore {
  vaultPath: string | null;
  fileTree: FileEntry[];
  loading: boolean;
  error: string | null;

  openVault: () => Promise<void>;
  loadVault: (path: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  closeVault: () => void;
  clearError: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  vaultPath: null,
  fileTree: [],
  loading: false,
  error: null,

  openVault: async () => {
    try {
      const path = await fs.openVault();
      if (path) {
        await get().loadVault(path);
      }
    } catch (e) {
      set({ error: `Failed to open vault: ${e}` });
    }
  },

  loadVault: async (path) => {
    set({ loading: true, error: null });
    try {
      const fileTree = await fs.listFiles(path);
      set({ vaultPath: path, fileTree, loading: false });
    } catch (e) {
      set({ error: `Failed to load vault: ${e}`, loading: false });
    }
  },

  refreshFiles: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    try {
      const fileTree = await fs.listFiles(vaultPath);
      set({ fileTree });
    } catch (e) {
      set({ error: `Failed to refresh files: ${e}` });
    }
  },

  closeVault: () => {
    fs.clearVaultPath();
    set({ vaultPath: null, fileTree: [], error: null });
  },

  clearError: () => set({ error: null }),
}));
