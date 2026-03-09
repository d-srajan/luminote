import { describe, it, expect } from "vitest";
import { parseWikiLinks, flattenFiles, resolveWikiLink } from "@/utils/wikilinks";
import type { FileEntry } from "@/types/note";

// ─── parseWikiLinks ───

describe("parseWikiLinks", () => {
  it("parses a basic wikilink", () => {
    const result = parseWikiLinks("Hello [[note]] world");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "note",
      display: "note",
      start: 6,
      end: 14,
    });
  });

  it("parses wikilink with display text", () => {
    const result = parseWikiLinks("See [[note|Custom Display]] here");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "note",
      display: "Custom Display",
      start: 4,
      end: 27,
    });
  });

  it("parses multiple wikilinks in one string", () => {
    const result = parseWikiLinks("Link [[one]] and [[two]] end");
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe("one");
    expect(result[1]!.name).toBe("two");
  });

  it("trims whitespace from name and display", () => {
    const result = parseWikiLinks("[[ note name ]]");
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("note name");
  });

  it("trims whitespace from display text", () => {
    const result = parseWikiLinks("[[ note | display ]]");
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("note");
    expect(result[0]!.display).toBe("display");
  });

  it("returns empty array when no wikilinks found", () => {
    expect(parseWikiLinks("no links here")).toEqual([]);
    expect(parseWikiLinks("")).toEqual([]);
    expect(parseWikiLinks("just [single] brackets")).toEqual([]);
  });

  it("handles link at start and end of string", () => {
    const result = parseWikiLinks("[[start]] middle [[end]]");
    expect(result).toHaveLength(2);
    expect(result[0]!.start).toBe(0);
    expect(result[1]!.end).toBe(24);
  });

  it("handles wikilink with spaces in name", () => {
    const result = parseWikiLinks("[[My Long Note Name]]");
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("My Long Note Name");
  });

  it("does not match empty wikilinks [[]]", () => {
    // The regex requires at least one character inside [[ ]]
    const result = parseWikiLinks("[[]]");
    expect(result).toHaveLength(0);
  });

  it("handles consecutive wikilinks", () => {
    const result = parseWikiLinks("[[one]][[two]][[three]]");
    expect(result).toHaveLength(3);
  });
});

// ─── flattenFiles ───

describe("flattenFiles", () => {
  it("returns empty array for empty input", () => {
    expect(flattenFiles([])).toEqual([]);
  });

  it("returns flat files as-is", () => {
    const files: FileEntry[] = [
      { name: "note1.md", path: "/vault/note1.md", is_dir: false, modified: 0, children: null },
      { name: "note2.md", path: "/vault/note2.md", is_dir: false, modified: 0, children: null },
    ];
    const result = flattenFiles(files);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "note1.md", path: "/vault/note1.md" });
    expect(result[1]).toEqual({ name: "note2.md", path: "/vault/note2.md" });
  });

  it("flattens nested folders", () => {
    const files: FileEntry[] = [
      {
        name: "folder",
        path: "/vault/folder",
        is_dir: true,
        modified: 0,
        children: [
          { name: "nested.md", path: "/vault/folder/nested.md", is_dir: false, modified: 0, children: null },
        ],
      },
    ];
    const result = flattenFiles(files);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("nested.md");
  });

  it("flattens deeply nested folders (3+ levels)", () => {
    const files: FileEntry[] = [
      {
        name: "a",
        path: "/a",
        is_dir: true,
        modified: 0,
        children: [
          {
            name: "b",
            path: "/a/b",
            is_dir: true,
            modified: 0,
            children: [
              {
                name: "c",
                path: "/a/b/c",
                is_dir: true,
                modified: 0,
                children: [
                  { name: "deep.md", path: "/a/b/c/deep.md", is_dir: false, modified: 0, children: null },
                ],
              },
            ],
          },
        ],
      },
    ];
    const result = flattenFiles(files);
    expect(result).toHaveLength(1);
    expect(result[0]!.path).toBe("/a/b/c/deep.md");
  });

  it("returns only files, not folders", () => {
    const files: FileEntry[] = [
      { name: "file.md", path: "/vault/file.md", is_dir: false, modified: 0, children: null },
      {
        name: "folder",
        path: "/vault/folder",
        is_dir: true,
        modified: 0,
        children: [
          { name: "inner.md", path: "/vault/folder/inner.md", is_dir: false, modified: 0, children: null },
        ],
      },
    ];
    const result = flattenFiles(files);
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.name.endsWith(".md"))).toBe(true);
  });

  it("handles empty folders", () => {
    const files: FileEntry[] = [
      { name: "empty", path: "/vault/empty", is_dir: true, modified: 0, children: [] },
    ];
    expect(flattenFiles(files)).toEqual([]);
  });
});

// ─── resolveWikiLink ───

describe("resolveWikiLink", () => {
  const fileTree: FileEntry[] = [
    { name: "Hello World.md", path: "/vault/Hello World.md", is_dir: false, modified: 0, children: null },
    { name: "readme.md", path: "/vault/readme.md", is_dir: false, modified: 0, children: null },
    {
      name: "notes",
      path: "/vault/notes",
      is_dir: true,
      modified: 0,
      children: [
        { name: "Deep Note.md", path: "/vault/notes/Deep Note.md", is_dir: false, modified: 0, children: null },
      ],
    },
  ];

  it("resolves exact match (case-insensitive)", () => {
    expect(resolveWikiLink("Hello World", fileTree)).toBe("/vault/Hello World.md");
    expect(resolveWikiLink("hello world", fileTree)).toBe("/vault/Hello World.md");
    expect(resolveWikiLink("HELLO WORLD", fileTree)).toBe("/vault/Hello World.md");
  });

  it("resolves nested file", () => {
    expect(resolveWikiLink("Deep Note", fileTree)).toBe("/vault/notes/Deep Note.md");
  });

  it("returns null for no match", () => {
    expect(resolveWikiLink("Nonexistent", fileTree)).toBeNull();
  });

  it("matches without .md extension", () => {
    expect(resolveWikiLink("readme", fileTree)).toBe("/vault/readme.md");
  });

  it("handles empty file tree", () => {
    expect(resolveWikiLink("anything", [])).toBeNull();
  });
});
