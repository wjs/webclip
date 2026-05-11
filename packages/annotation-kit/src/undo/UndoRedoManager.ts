// Snapshot-based undo/redo using fabric's built-in serialization
// Simpler and more reliable than the original's per-operation approach

import { fabric } from 'fabric';
import { CustomProperty } from '../types';

export class UndoRedoManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxDepth = 100;

  pushSnapshot(canvas: fabric.Canvas): void {
    const json = JSON.stringify(canvas.toJSON(CustomProperty));
    if (this.undoStack.length >= this.maxDepth) {
      this.undoStack.shift();
    }
    this.undoStack.push(json);
    this.redoStack = []; // clear redo on new action
  }

  undo(canvas: fabric.Canvas): boolean {
    if (this.undoStack.length === 0) return false;

    // Save current state for redo
    const current = JSON.stringify(canvas.toJSON(CustomProperty));
    this.redoStack.push(current);

    // Restore previous state (loadFromJSON uses callback, not Promise)
    const previous = this.undoStack.pop()!;
    canvas.loadFromJSON(JSON.parse(previous), () => {
      canvas.renderAll();
    });

    return true;
  }

  redo(canvas: fabric.Canvas): boolean {
    if (this.redoStack.length === 0) return false;

    // Save current state for undo
    const current = JSON.stringify(canvas.toJSON(CustomProperty));
    this.undoStack.push(current);

    // Restore next state
    const next = this.redoStack.pop()!;
    canvas.loadFromJSON(JSON.parse(next), () => {
      canvas.renderAll();
    });

    return true;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  reset(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}