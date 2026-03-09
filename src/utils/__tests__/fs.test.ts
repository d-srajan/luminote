import { describe, it, expect, beforeEach } from "vitest";
import { fs } from "@/utils/fs";

// These tests exercise the browser-mode (in-memory Map) filesystem.
// Tauri mode is skipped because it requires the Rust backend.

describe("fs (browser mode)", () => {
  beforeEach(async () => {
    // Clear all in-memory files and localStorage between tests
    const files = await fs.listFiles("/browser-vault");
    for (const f of files) {
      if (f.is_dir) {
        await fs.deleteFolder(f.path);
      } else {
        await fs.deleteNote(f.path);
      }
    }
    localStorage.clear();
  });

  // ─── openVault ───

  describe("openVault", () => {
    it("returns browser-vault path", async () => {
      const path = await fs.openVault();
      expect(path).toBe("/browser-vault");
    });

    it("saves vault path to localStorage", async () => {
      await fs.openVault();
      expect(fs.getSavedVaultPath()).toBe("/browser-vault");
    });
  });

  // ─── getSavedVaultPath / clearVaultPath ───

  describe("getSavedVaultPath / clearVaultPath", () => {
    it("returns null when no path saved", () => {
      expect(fs.getSavedVaultPath()).toBeNull();
    });

    it("clears saved vault path", async () => {
      await fs.openVault();
      expect(fs.getSavedVaultPath()).toBe("/browser-vault");
      fs.clearVaultPath();
      expect(fs.getSavedVaultPath()).toBeNull();
    });
  });

  // ─── createNote / readNote / saveNote ───

  describe("note CRUD", () => {
    it("creates a note and reads it back", async () => {
      const path = await fs.createNote("test", "/browser-vault");
      expect(path).toBe("/browser-vault/test.md");

      const content = await fs.readNote(path);
      expect(content).toBe("");
    });

    it("appends .md if not present", async () => {
      const path = await fs.createNote("hello", "/browser-vault");
      expect(path).toBe("/browser-vault/hello.md");
    });

    it("does not double .md extension", async () => {
      const path = await fs.createNote("hello.md", "/browser-vault");
      expect(path).toBe("/browser-vault/hello.md");
    });

    it("saves and reads content", async () => {
      const path = await fs.createNote("test", "/browser-vault");
      await fs.saveNote(path, "Hello World");
      const content = await fs.readNote(path);
      expect(content).toBe("Hello World");
    });

    it("returns empty string for nonexistent note", async () => {
      const content = await fs.readNote("/browser-vault/nonexistent.md");
      expect(content).toBe("");
    });
  });

  // ─── deleteNote ───

  describe("deleteNote", () => {
    it("deletes a note", async () => {
      const path = await fs.createNote("to-delete", "/browser-vault");
      await fs.saveNote(path, "content");
      await fs.deleteNote(path);

      const content = await fs.readNote(path);
      expect(content).toBe("");
    });
  });

  // ─── renameNote ───

  describe("renameNote", () => {
    it("renames a note preserving content", async () => {
      const oldPath = await fs.createNote("old", "/browser-vault");
      await fs.saveNote(oldPath, "my content");

      const newPath = "/browser-vault/new.md";
      await fs.renameNote(oldPath, newPath);

      expect(await fs.readNote(oldPath)).toBe("");
      expect(await fs.readNote(newPath)).toBe("my content");
    });
  });

  // ─── listFiles ───

  describe("listFiles", () => {
    it("returns empty array for empty vault", async () => {
      const files = await fs.listFiles("/browser-vault");
      expect(files).toEqual([]);
    });

    it("lists created notes", async () => {
      await fs.createNote("alpha", "/browser-vault");
      await fs.createNote("beta", "/browser-vault");

      const files = await fs.listFiles("/browser-vault");
      expect(files).toHaveLength(2);
      expect(files.map((f) => f.name).sort()).toEqual(["alpha.md", "beta.md"]);
    });

    it("sorts folders before files", async () => {
      await fs.createNote("file", "/browser-vault");
      await fs.createFolder("/browser-vault/folder");

      const files = await fs.listFiles("/browser-vault");
      expect(files[0]!.is_dir).toBe(true);
      expect(files[0]!.name).toBe("folder");
    });
  });

  // ─── createFolder / deleteFolder ───

  describe("folder operations", () => {
    it("creates a folder that appears in listing", async () => {
      await fs.createFolder("/browser-vault/my-folder");
      const files = await fs.listFiles("/browser-vault");
      const folder = files.find((f) => f.name === "my-folder");
      expect(folder).toBeDefined();
      expect(folder!.is_dir).toBe(true);
    });

    it("deletes a folder and its contents", async () => {
      await fs.createFolder("/browser-vault/to-delete");
      await fs.createNote("inner", "/browser-vault/to-delete");
      await fs.deleteFolder("/browser-vault/to-delete");

      const files = await fs.listFiles("/browser-vault");
      expect(files.find((f) => f.name === "to-delete")).toBeUndefined();
    });
  });

  // ─── moveFile ───

  describe("moveFile", () => {
    it("moves a file to a new directory", async () => {
      const path = await fs.createNote("moveme", "/browser-vault");
      await fs.saveNote(path, "mobile content");
      await fs.createFolder("/browser-vault/dest");

      const newPath = await fs.moveFile(path, "/browser-vault/dest");
      expect(newPath).toBe("/browser-vault/dest/moveme.md");
      expect(await fs.readNote(newPath)).toBe("mobile content");
      expect(await fs.readNote(path)).toBe("");
    });
  });

  // ─── renameFolder ───

  describe("renameFolder", () => {
    it("renames a folder and updates paths of contents", async () => {
      await fs.createFolder("/browser-vault/old-name");
      await fs.createNote("inside", "/browser-vault/old-name");
      await fs.saveNote("/browser-vault/old-name/inside.md", "data");

      await fs.renameFolder("/browser-vault/old-name", "/browser-vault/new-name");

      expect(await fs.readNote("/browser-vault/new-name/inside.md")).toBe("data");
      expect(await fs.readNote("/browser-vault/old-name/inside.md")).toBe("");
    });
  });
});
