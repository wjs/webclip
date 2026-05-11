import React, { useEffect, useRef } from 'react';
import { AnnotationCanvas } from '../AnnotationCanvas';
import { useAnnotationStore } from '../store/annotationStore';
// Register custom shapes so fabric knows about LineArrow and Label
import '../shapes/LineArrow';
import '../shapes/Label';

interface AnnotationOverlayProps {
  canvasWidth?: number;
  canvasHeight?: number;
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  canvasWidth,
  canvasHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<AnnotationCanvas | null>(null);
  const { isReady, activeTool, style } = useAnnotationStore();

  // Create AnnotationCanvas on mount, destroy on unmount
  useEffect(() => {
    if (!containerRef.current) return;

    const editor = new AnnotationCanvas(
      containerRef.current,
      canvasWidth,
      canvasHeight,
    );
    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [canvasWidth, canvasHeight]);

  // Sync drawing mode when tool changes
  useEffect(() => {
    if (editorRef.current && isReady) {
      editorRef.current.setDrawingMode(activeTool);
    }
  }, [activeTool, isReady]);

  // Sync style changes
  useEffect(() => {
    if (editorRef.current && isReady) {
      editorRef.current.updateStyle();
    }
  }, [style, isReady]);

  // Handle window resize — adjust canvas zoom
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current && containerRef.current) {
        editorRef.current.adjustCanvasZoom(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ pointerEvents: 'auto' }}
    />
  );
};