import React, { useCallback, useEffect, useState } from 'react';
import { AreaSelector, AnnotationOverlay, AnnotationToolbar, useExport, useAnnotationStore } from 'annotation-kit';

interface OverlayContainerProps {
  onClose: () => void;
}

type Phase = 'selecting' | 'annotating';

export const OverlayContainer: React.FC<OverlayContainerProps> = ({
  onClose,
}) => {
  const [phase, setPhase] = useState<Phase>('selecting');
  const [selectedRect, setSelectedRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const { exportSelectedAreaPng, copyToClipboard } = useExport('webclip');

  // Lock page scroll while overlay is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleAreaSelected = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) => {
      setSelectedRect(rect);
      setPhase('annotating');
    },
    [],
  );

  const handleCancelSelection = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleReSelect = useCallback(() => {
    setPhase('selecting');
    setSelectedRect(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!selectedRect || saving) return;
    setSaving(true);

    const canvasEl = document.querySelector('#ak-canvas') as HTMLCanvasElement | null;
    const lowerCanvas = canvasEl?.parentElement?.querySelector('.lower-canvas') as HTMLCanvasElement | null;
    const annotationCanvas = lowerCanvas || canvasEl;

    try {
      const ok = await copyToClipboard(selectedRect, annotationCanvas, 1);
      if (ok) onClose();
    } catch (err) {
      console.error('Copy failed:', err);
    }
    setSaving(false);
  }, [selectedRect, saving, copyToClipboard, onClose]);

  const handleSave = useCallback(async () => {
    if (!selectedRect || saving) return;
    setSaving(true);

    const canvasEl = document.querySelector('#ak-canvas') as HTMLCanvasElement | null;
    const lowerCanvas = canvasEl?.parentElement?.querySelector('.lower-canvas') as HTMLCanvasElement | null;
    const annotationCanvas = lowerCanvas || canvasEl;

    try {
      const ok = await exportSelectedAreaPng(selectedRect, annotationCanvas, 1);
      if (ok) onClose();
    } catch (err) {
      console.error('Export failed:', err);
    }
    setSaving(false);
  }, [selectedRect, saving, exportSelectedAreaPng, onClose]);

  // --- Phase 1: Area selection ---
  if (phase === 'selecting') {
    return (
      <AreaSelector
        onComplete={handleAreaSelected}
        onCancel={handleCancelSelection}
      />
    );
  }

  // --- Phase 2: Annotation ---
  if (!selectedRect) return null;

  const r = selectedRect;
  const toolbarFitsBelow = r.y + r.height + 50 < window.innerHeight;
  const toolbarTop = toolbarFitsBelow ? r.y + r.height + 8 : r.y - 44 - 8;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Full-screen mask */}
      <div className="ak-mask" style={{ top: 0, left: 0, right: 0, bottom: 0 }} />

      {/* Punch hole: 4 mask strips around the selected area */}
      <div className="ak-mask" style={{ top: 0, left: 0, right: 0, height: r.y }} />
      <div className="ak-mask" style={{ top: r.y + r.height, left: 0, right: 0, bottom: 0 }} />
      <div className="ak-mask" style={{ top: r.y, left: 0, width: r.x, height: r.height }} />
      <div className="ak-mask" style={{ top: r.y, left: r.x + r.width, right: 0, height: r.height }} />

      {/* Annotation canvas inside the selected area */}
      <div
        style={{
          position: 'absolute',
          left: r.x,
          top: r.y,
          width: r.width,
          height: r.height,
          overflow: 'hidden',
          pointerEvents: 'auto',
          border: '2px solid #3b82f6',
          boxShadow: '0 0 0 1px rgba(59,130,246,0.5), 0 0 6px rgba(59,130,246,0.4)',
        }}
      >
        <AnnotationOverlay canvasWidth={r.width} canvasHeight={r.height} />
      </div>

      {/* Toolbar + action buttons below the selection */}
      <div
        style={{
          position: 'absolute',
          left: r.x,
          top: toolbarTop,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <AnnotationToolbar />
        <div className="ak-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? '#93c5fd' : '#2563eb',
              color: 'white',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '处理中...' : '保存'}
          </button>
          <button
            onClick={handleCopy}
            disabled={saving}
            style={{
              background: saving ? '#d1d5db' : '#059669',
              color: 'white',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '处理中...' : '复制'}
          </button>
          <button
            onClick={handleReSelect}
            style={{ background: '#6b7280', color: 'white' }}
          >
            重选
          </button>
          <button
            onClick={handleClose}
            style={{ background: '#4b5563', color: 'white' }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};