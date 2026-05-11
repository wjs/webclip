// Hook for managing the active drawing tool lifecycle
// Coordinates tool creation, resizing, and committing

import { useCallback, useRef } from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import { ToolType } from '../types';

export function useDrawingTool() {
  const { activeTool, setActiveTool } = useAnnotationStore();
  const drawingOriginRef = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = useCallback(
    (x: number, y: number) => {
      drawingOriginRef.current = { x, y };
    },
    [],
  );

  const finishDrawing = useCallback(() => {
    drawingOriginRef.current = null;
  }, []);

  const isDrawingTool = useCallback(
    () =>
      activeTool !== ToolType.Select &&
      activeTool !== ToolType.Delete &&
      activeTool !== ToolType.Pen,
    [activeTool],
  );

  return { startDrawing, finishDrawing, isDrawingTool, drawingOriginRef };
}