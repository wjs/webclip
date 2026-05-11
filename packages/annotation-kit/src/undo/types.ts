// Snapshot type for undo/redo

export interface AnnotationSnapshot {
  version: string;
  objects: unknown[];
  backgroundImage?: string;
}