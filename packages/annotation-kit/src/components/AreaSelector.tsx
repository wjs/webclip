import React, { useCallback, useEffect, useState } from 'react';

interface AreaSelectorProps {
  onComplete: (rect: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

interface DragState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function computeRect(sel: DragState) {
  return {
    x: Math.min(sel.startX, sel.endX),
    y: Math.min(sel.startY, sel.endY),
    width: Math.abs(sel.endX - sel.startX),
    height: Math.abs(sel.endY - sel.startY),
  };
}

export const AreaSelector: React.FC<AreaSelectorProps> = ({ onComplete, onCancel }) => {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDrag({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !drag) return;
    setDrag({ ...drag, endX: e.clientX, endY: e.clientY });
  }, [isDragging, drag]);

  const onMouseUp = useCallback(() => {
    if (!drag) return;
    setIsDragging(false);
    const rect = computeRect(drag);
    if (rect.width < 10 || rect.height < 10) {
      setDrag(null);
      return;
    }
    onComplete(rect);
  }, [drag, onComplete]);

  // Escape to cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const rect = drag ? computeRect(drag) : null;

  return (
    <div
      className="ak-area-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        cursor: 'crosshair',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Semi-transparent mask over entire viewport */}
      <div className="ak-mask" style={{ inset: 0 }} />

      {/* If dragging: punch a hole with 4 strips, clear inside the rect */}
      {rect && (
        <>
          {/* Top mask */}
          <div className="ak-mask" style={{ top: 0, left: 0, right: 0, height: rect.y }} />
          {/* Bottom mask */}
          <div className="ak-mask" style={{ top: rect.y + rect.height, left: 0, right: 0, bottom: 0 }} />
          {/* Left mask */}
          <div className="ak-mask" style={{ top: rect.y, left: 0, width: rect.x, height: rect.height }} />
          {/* Right mask */}
          <div className="ak-mask" style={{ top: rect.y, left: rect.x + rect.width, right: 0, height: rect.height }} />

          {/* Selection border */}
          <div className="ak-select-border" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }} />

          {/* Size indicator */}
          {isDragging && rect.width > 30 && rect.height > 30 && (
            <div className="ak-size-label" style={{ left: rect.x, top: rect.y + rect.height + 4 }}>
              {Math.round(rect.width)} × {Math.round(rect.height)}
            </div>
          )}
        </>
      )}

      {/* Hint when no selection yet */}
      {!rect && (
        <div className="ak-hint">拖拽选择截图区域</div>
      )}
    </div>
  );
};