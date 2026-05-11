// Hook for object selection management on fabric canvas

import { useCallback } from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import { ToolType } from '../types';

export function useSelection() {
  const { selectObject } = useAnnotationStore();

  const handleObjectSelected = useCallback(
    (objectId: string, toolType: ToolType) => {
      selectObject(objectId, toolType);
    },
    [selectObject],
  );

  const handleSelectionCleared = useCallback(() => {
    selectObject(null, null);
  }, [selectObject]);

  return { handleObjectSelected, handleSelectionCleared };
}