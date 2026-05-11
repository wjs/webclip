import React from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import { ToolType, DrawingStyle } from '../types';
import { COLOR_MAP, WEIGHT_MAP, FONT_SIZE_MAP } from '../constants';

const TOOL_CONFIG = [
  { tool: ToolType.Select, label: 'Select', icon: '☝' },
  { tool: ToolType.Rect, label: 'Rect', icon: '▭' },
  { tool: ToolType.Circle, label: 'Circle', icon: '◯' },
  { tool: ToolType.Arrow, label: 'Arrow', icon: '→' },
  { tool: ToolType.Text, label: 'Text', icon: 'T' },
  { tool: ToolType.Label, label: 'Label', icon: '💬' },
  { tool: ToolType.Pen, label: 'Pen', icon: '✎' },
  { tool: ToolType.Delete, label: 'Delete', icon: '✕' },
];

export const AnnotationToolbar: React.FC = () => {
  const { activeTool, style, canUndo, canRedo, setActiveTool, setStyle } =
    useAnnotationStore();

  return (
    <div className="ak-toolbar">
      {/* Undo */}
      <button
        className={canUndo ? '' : 'disabled'}
        onClick={() => document.dispatchEvent(new CustomEvent('ak-undo'))}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        ↩
      </button>
      {/* Redo */}
      <button
        className={canRedo ? '' : 'disabled'}
        onClick={() => document.dispatchEvent(new CustomEvent('ak-redo'))}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        ↪
      </button>

      <div className="ak-divider" />

      {/* Tool buttons */}
      {TOOL_CONFIG.map(({ tool, label, icon }) => (
        <button
          key={tool}
          className={activeTool === tool ? 'active' : ''}
          onClick={() => setActiveTool(tool)}
          title={label}
        >
          {icon}
        </button>
      ))}

      {/* Style picker */}
      {activeTool !== ToolType.Select && activeTool !== ToolType.Delete && (
        <>
          <div className="ak-divider" />
          <StylePicker style={style} onStyleChange={setStyle} />
        </>
      )}
    </div>
  );
};

const StylePicker: React.FC<{
  style: DrawingStyle;
  onStyleChange: (partial: Partial<DrawingStyle>) => void;
}> = ({ style, onStyleChange }) => {
  const activeTool = useAnnotationStore.getState().activeTool;
  const showFontSize = activeTool === ToolType.Text || activeTool === ToolType.Label;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Colors */}
      {COLOR_MAP.map((color) => (
        <button
          key={color}
          className={`ak-color ${style.color === color ? 'active' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onStyleChange({ color })}
        />
      ))}

      {/* Weight */}
      {WEIGHT_MAP.map((weight) => (
        <button
          key={weight}
          className={`ak-weight ${style.weight === weight ? 'active' : ''}`}
          onClick={() => onStyleChange({ weight })}
        >
          <div className="ak-weight-dot" style={{ width: Math.max(weight * 1.5, 3), height: Math.max(weight * 1.5, 3) }} />
        </button>
      ))}

      {/* Font size */}
      {showFontSize && (
        <>
          <div className="ak-divider" />
          {FONT_SIZE_MAP.map((fontSize) => (
            <button
              key={fontSize}
              className={style.fontSize === fontSize ? 'active' : ''}
              style={{ fontSize: 12, padding: '2px 4px' }}
              onClick={() => onStyleChange({ fontSize })}
            >
              {fontSize}
            </button>
          ))}
        </>
      )}
    </div>
  );
};