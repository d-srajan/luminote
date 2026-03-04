export interface Note {
  id: string;
  title: string;
  content: string;
  path: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  isOpen: boolean;
}

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  modified: number;
  children: FileEntry[] | null;
}
