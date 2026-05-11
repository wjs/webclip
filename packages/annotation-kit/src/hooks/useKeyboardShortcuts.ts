import { useEffect } from 'react';

// Keyboard shortcuts with guaranteed cleanup — no memory leak like the original
export function useKeyboardShortcuts(
  onUndo: () => void,
  onRedo: () => void,
  onDelete: () => void,
  onEscape: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (not Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        onRedo();
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDelete();
      }
      // Escape
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup — listener removed on unmount (fixes original's memory leak)
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onRedo, onDelete, onEscape]);
}