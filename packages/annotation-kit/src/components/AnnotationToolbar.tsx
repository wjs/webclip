import React from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import { ToolType, DrawingStyle } from '../types';
import { COLOR_MAP, WEIGHT_MAP, FONT_SIZE_MAP } from '../constants';
import {
  SelectIcon,
  RectIcon,
  CircleIcon,
  ArrowIcon,
  TextIcon,
  LabelIcon,
  PenIcon,
  DeleteIcon,
  UndoIcon,
  RedoIcon,
} from './icons';

const TOOL_CONFIG: { tool: ToolType; label: string; tooltip: string; icon: React.ReactNode }[] = [
  { tool: ToolType.Select, label: 'Select', tooltip: '选择 (V)', icon: <SelectIcon /> },
  { tool: ToolType.Rect, label: 'Rect', tooltip: '矩形 (R)', icon: <RectIcon /> },
  { tool: ToolType.Circle, label: 'Circle', tooltip: '圆形 (C)', icon: <CircleIcon /> },
  { tool: ToolType.Arrow, label: 'Arrow', tooltip: '箭头 (A)', icon: <ArrowIcon /> },
  { tool: ToolType.Text, label: 'Text', tooltip: '文字 (T)', icon: <TextIcon /> },
  { tool: ToolType.Label, label: 'Label', tooltip: '标注 (L)', icon: <LabelIcon /> },
  { tool: ToolType.Pen, label: 'Pen', tooltip: '画笔 (P)', icon: <PenIcon /> },
  { tool: ToolType.Delete, label: 'Delete', tooltip: '删除 (D)', icon: <DeleteIcon /> },
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
        data-tooltip="撤销 (Ctrl+Z)"
      >
        <UndoIcon />
      </button>
      {/* Redo */}
      <button
        className={canRedo ? '' : 'disabled'}
        onClick={() => document.dispatchEvent(new CustomEvent('ak-redo'))}
        disabled={!canRedo}
        data-tooltip="重做 (Ctrl+Y)"
      >
        <RedoIcon />
      </button>

      <div className="ak-divider" />

      {/* Tool buttons */}
      {TOOL_CONFIG.map(({ tool, icon, tooltip }) => (
        <button
          key={tool}
          className={activeTool === tool ? 'active' : ''}
          onClick={() => setActiveTool(tool)}
          data-tooltip={tooltip}
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
          data-tooltip="颜色"
        />
      ))}

      {/* Weight */}
      {WEIGHT_MAP.map((weight) => (
        <button
          key={weight}
          className={`ak-weight ${style.weight === weight ? 'active' : ''}`}
          onClick={() => onStyleChange({ weight })}
          data-tooltip={`线宽 ${weight}`}
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
              data-tooltip={`字号 ${fontSize}`}
            >
              {fontSize}
            </button>
          ))}
        </>
      )}
    </div>
  );
};