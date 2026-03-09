import { create } from "zustand";
import { toast } from "sonner";
import { fs } from "@/utils/fs";
import type { FileEntry } from "@/types/note";

interface VaultStore {
  vaultPath: string | null;
  fileTree: FileEntry[];
  loading: boolean;

  openVault: () => Promise<void>;
  loadVault: (path: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  closeVault: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  vaultPath: null,
  fileTree: [],
  loading: false,

  openVault: async () => {
    try {
      const path = await fs.openVault();
      if (path) {
        await get().loadVault(path);
      }
    } catch (e) {
      toast.error(`Failed to open vault: ${e}`);
    }
  },

  loadVault: async (path) => {
    set({ loading: true });
    try {
      const fileTree = await fs.listFiles(path);
      set({ vaultPath: path, fileTree, loading: false });
      toast.success("Vault loaded");
    } catch (e) {
      toast.error(`Failed to load vault: ${e}`);
      set({ loading: false });
    }
  },

  refreshFiles: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    try {
      const fileTree = await fs.listFiles(vaultPath);
      set({ fileTree });
    } catch (e) {
      toast.error(`Failed to refresh files: ${e}`);
    }
  },

  closeVault: () => {
    fs.clearVaultPath();
    set({ vaultPath: null, fileTree: [] });
  },
}));
