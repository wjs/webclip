import React, { useEffect } from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import { ToolType } from '../types';

export const ToolButton: React.FC<{
  tool: ToolType;
  label: string;
  icon: string;
}> = ({ tool, label, icon }) => {
  const { activeTool, setActiveTool } = useAnnotationStore();

  return (
    <button
      onClick={() => setActiveTool(tool)}
      className={`px-2 py-1 rounded text-sm font-medium ${
        activeTool === tool
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={label}
    >
      {icon}
    </button>
  );
};