import React from 'react';

// TextEditorOverlay — HTML textarea overlay for text editing
// Alternative to fabric.IText's hidden textarea approach.
// On double-click of a text/label annotation, show this positioned
// textarea for native text editing with IME support.

interface TextEditorOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  initialText: string;
  fontSize: number;
  color: string;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export const TextEditorOverlay: React.FC<TextEditorOverlayProps> = ({
  x,
  y,
  width,
  height,
  initialText,
  fontSize,
  color,
  onCommit,
  onCancel,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCommit(textareaRef.current?.value ?? '');
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onCommit(textareaRef.current?.value ?? '');
  };

  return (
    <textarea
      ref={textareaRef}
      defaultValue={initialText}
      className="absolute border-2 bg-transparent resize-none outline-none"
      style={{
        left: x,
        top: y,
        width: Math.max(width, 100),
        height: Math.max(height, 30),
        fontSize,
        color,
        borderColor: color,
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};