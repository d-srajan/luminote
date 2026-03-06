import type { FileEntry } from "@/types/note";

export interface WikiLink {
  name: string;
  display: string;
  start: number;
  end: number;
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Parse all [[wikilinks]] from a string.
 */
export function parseWikiLinks(text: string): WikiLink[] {
  const results: WikiLink[] = [];
  let match: RegExpExecArray | null;
  WIKILINK_RE.lastIndex = 0;
  while ((match = WIKILINK_RE.exec(text)) !== null) {
    const name = match[1]!.trim();
    const display = match[2]?.trim() || name;
    results.push({ name, display, start: match.index, end: match.index + match[0].length });
  }
  return results;
}

export interface FlatFile {
  name: string;
  path: string;
}

/**
 * Flatten the file tree to a list of .md files.
 */
export function flattenFiles(entries: FileEntry[]): FlatFile[] {
  const result: FlatFile[] = [];
  for (const entry of entries) {
    if (entry.is_dir && entry.children) {
      result.push(...flattenFiles(entry.children));
    } else if (!entry.is_dir) {
      result.push({ name: entry.name, path: entry.path });
    }
  }
  return result;
}

/**
 * Resolve a wikilink name to a file path.
 * Matches case-insensitively against filenames (without .md extension).
 */
export function resolveWikiLink(name: string, fileTree: FileEntry[]): string | null {
  const lower = name.toLowerCase();
  const files = flattenFiles(fileTree);
  const match = files.find((f) => f.name.replace(/\.md$/, "").toLowerCase() === lower);
  return match?.path ?? null;
}
