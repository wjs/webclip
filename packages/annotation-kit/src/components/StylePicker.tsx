import React from 'react';
import { DrawingStyle } from '../types';
import { COLOR_MAP, WEIGHT_MAP, FONT_SIZE_MAP } from '../constants';

export const StylePicker: React.FC<{
  style: DrawingStyle;
  onStyleChange: (partial: Partial<DrawingStyle>) => void;
  showFontSize?: boolean;
}> = ({ style, onStyleChange, showFontSize = false }) => {
  return (
    <div className="flex items-center gap-2">
      {/* Colors */}
      <div className="flex gap-1">
        {COLOR_MAP.map((color) => (
          <button
            key={color}
            onClick={() => onStyleChange({ color })}
            className={`w-5 h-5 rounded-full border-2 ${
              style.color === color ? 'border-blue-500' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Weight */}
      <div className="flex gap-1">
        {WEIGHT_MAP.map((weight) => (
          <button
            key={weight}
            onClick={() => onStyleChange({ weight })}
            className={`w-6 h-6 rounded flex items-center justify-center ${
              style.weight === weight ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            <div
              className="rounded-full bg-gray-700"
              style={{
                width: `${Math.max(weight * 1.5, 3)}px`,
                height: `${Math.max(weight * 1.5, 3)}px`,
              }}
            />
          </button>
        ))}
      </div>

      {/* Font size */}
      {showFontSize && (
        <div className="flex gap-1">
          {FONT_SIZE_MAP.map((fontSize) => (
            <button
              key={fontSize}
              onClick={() => onStyleChange({ fontSize })}
              className={`px-1.5 py-0.5 rounded text-xs ${
                style.fontSize === fontSize
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'text-gray-600'
              }`}
            >
              {fontSize}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};