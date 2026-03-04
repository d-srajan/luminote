import type { FileEntry } from "@/types/note";

const VAULT_PATH_KEY = "luminote_vault_path";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// In-memory store for browser mode
const memoryFs = new Map<string, string>();
const BROWSER_VAULT = "/browser-vault";

function memListFiles(dir: string): FileEntry[] {
  const entries: FileEntry[] = [];
  const prefix = dir.endsWith("/") ? dir : `${dir}/`;

  const seen = new Set<string>();
  for (const path of memoryFs.keys()) {
    if (!path.startsWith(prefix)) continue;
    const relative = path.slice(prefix.length);
    const parts = relative.split("/");
    const name = parts[0]!;

    if (parts.length === 1 && name.endsWith(".md")) {
      entries.push({
        name,
        path,
        is_dir: false,
        modified: Date.now(),
        children: null,
      });
    } else if (parts.length > 1 && !seen.has(name)) {
      seen.add(name);
      const folderPath = `${prefix}${name}`;
      entries.push({
        name,
        path: folderPath,
        is_dir: true,
        modified: Date.now(),
        children: memListFiles(folderPath),
      });
    }
  }

  entries.sort((a, b) =>
    Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name),
  );
  return entries;
}

async function tauriInvoke<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

export const fs = {
  async openVault(): Promise<string | null> {
    if (!isTauri) {
      localStorage.setItem(VAULT_PATH_KEY, BROWSER_VAULT);
      return BROWSER_VAULT;
    }
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select your vault folder",
    });
    if (typeof selected === "string") {
      localStorage.setItem(VAULT_PATH_KEY, selected);
      return selected;
    }
    return null;
  },

  getSavedVaultPath(): string | null {
    return localStorage.getItem(VAULT_PATH_KEY);
  },

  clearVaultPath(): void {
    localStorage.removeItem(VAULT_PATH_KEY);
  },

  async listFiles(path: string): Promise<FileEntry[]> {
    if (!isTauri) return memListFiles(path);
    return tauriInvoke<FileEntry[]>("list_files", { path });
  },

  async readNote(path: string): Promise<string> {
    if (!isTauri) return memoryFs.get(path) ?? "";
    return tauriInvoke<string>("read_note", { path });
  },

  async saveNote(path: string, content: string): Promise<void> {
    if (!isTauri) {
      memoryFs.set(path, content);
      return;
    }
    return tauriInvoke("save_note", { path, content });
  },

  async createNote(name: string, dirPath: string): Promise<string> {
    const fileName = name.endsWith(".md") ? name : `${name}.md`;
    const fullPath = `${dirPath}/${fileName}`;
    if (!isTauri) {
      memoryFs.set(fullPath, "");
      return fullPath;
    }
    return tauriInvoke<string>("create_note", { name, dirPath });
  },

  async deleteNote(path: string): Promise<void> {
    if (!isTauri) {
      memoryFs.delete(path);
      return;
    }
    return tauriInvoke("delete_note", { path });
  },

  async renameNote(oldPath: string, newPath: string): Promise<void> {
    if (!isTauri) {
      const content = memoryFs.get(oldPath) ?? "";
      memoryFs.delete(oldPath);
      memoryFs.set(newPath, content);
      return;
    }
    return tauriInvoke("rename_note", { oldPath, newPath });
  },

  async createFolder(path: string): Promise<void> {
    if (!isTauri) {
      // Create a marker so the folder shows up
      memoryFs.set(`${path}/.folder`, "");
      return;
    }
    return tauriInvoke("create_folder", { path });
  },

  async deleteFolder(path: string): Promise<void> {
    if (!isTauri) {
      const prefix = path.endsWith("/") ? path : `${path}/`;
      for (const key of memoryFs.keys()) {
        if (key.startsWith(prefix)) memoryFs.delete(key);
      }
      return;
    }
    return tauriInvoke("delete_folder", { path });
  },

  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    if (!isTauri) {
      const oldPrefix = oldPath.endsWith("/") ? oldPath : `${oldPath}/`;
      const newPrefix = newPath.endsWith("/") ? newPath : `${newPath}/`;
      for (const [key, val] of [...memoryFs.entries()]) {
        if (key.startsWith(oldPrefix)) {
          memoryFs.delete(key);
          memoryFs.set(key.replace(oldPrefix, newPrefix), val);
        }
      }
      return;
    }
    return tauriInvoke("rename_folder", { oldPath, newPath });
  },
};
