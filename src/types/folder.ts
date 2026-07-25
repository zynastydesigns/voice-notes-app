export type FolderColor =
  | "orange"
  | "purple"
  | "violet"
  | "blue"
  | "pink"
  | "teal"
  | "green"
  | "amber";

export interface Folder {
  id: string;
  ownerId: string;
  name: string;
  color: FolderColor;
  noteCount: number;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFolderInput {
  name: string;
  color: FolderColor;
}
