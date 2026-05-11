import React from 'react';
import { useExport } from '../hooks/useExport';

interface ExportPanelProps {
  onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
  const { exportSelectedAreaPng, copyToClipboard, exportJson } = useExport();

  // ExportPanel needs selectedRect — it should be passed by the host project
  // For now, this is a placeholder that the host can adapt

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Export</h3>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};