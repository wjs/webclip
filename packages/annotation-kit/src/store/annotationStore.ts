import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolType } from '../types';
import { DEFAULT_DRAWING_STYLE } from '../constants';
import type { DrawingStyle } from '../types';

export interface AnnotationState {
  // Canvas state
  isReady: boolean;
  activeTool: ToolType;
  style: DrawingStyle;

  // Selection
  selectedObjectId: string | null;
  selectedObjectToolType: ToolType | null;

  // Undo/redo (synced from UndoRedoManager)
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setStyle: (partial: Partial<DrawingStyle>) => void;
  selectObject: (id: string | null, toolType?: ToolType | null) => void;
  setReady: (ready: boolean) => void;
  setUndoRedoState: (canUndo: boolean, canRedo: boolean) => void;
  resetCanvas: () => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  persist(
    (set) => ({
      isReady: false,
      activeTool: ToolType.Select,
      style: { ...DEFAULT_DRAWING_STYLE },
      selectedObjectId: null,
      selectedObjectToolType: null,
      canUndo: false,
      canRedo: false,

      setActiveTool: (tool) => set({ activeTool: tool }),
      setStyle: (partial) =>
        set((state) => ({ style: { ...state.style, ...partial } })),
      selectObject: (id, toolType) =>
        set({ selectedObjectId: id, selectedObjectToolType: toolType ?? null }),
      setReady: (ready) => set({ isReady: ready }),
      setUndoRedoState: (canUndo, canRedo) =>
        set({ canUndo, canRedo }),
      resetCanvas: () =>
        set({
          isReady: false,
          activeTool: ToolType.Select,
          selectedObjectId: null,
          selectedObjectToolType: null,
          canUndo: false,
          canRedo: false,
        }),
    }),
    {
      name: 'annotation-kit-storage',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ['style'].includes(key)),
        ),
    },
  ),
);