// annotation-kit — barrel export

// Types (values: enums, const arrays; types: interfaces)
export { ToolType, CursorMode, OperationType, CustomProperty, Direction } from './types';
export type { DrawingStyle, Operation, ScreenshotProvider, ExportConfig } from './types';

// Constants
export { COLOR_MAP, WEIGHT_MAP, FONT_SIZE_MAP, DEFAULT_DRAWING_STYLE, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from './constants';

// Core
export { AnnotationCanvas } from './AnnotationCanvas';

// Store
export { useAnnotationStore } from './store/annotationStore';
export type { AnnotationState } from './store/annotationStore';

// Undo
export { UndoRedoManager } from './undo/UndoRedoManager';
export type { AnnotationSnapshot } from './undo/types';

// Context
export { ScreenshotProviderWrapper, ScreenshotContext, useScreenshotProvider } from './context/ScreenshotContext';

// Hooks
export { useDrawingTool } from './hooks/useDrawingTool';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
export { useSelection } from './hooks/useSelection';
export { useExport } from './hooks/useExport';

// Components
export { AnnotationOverlay } from './components/AnnotationOverlay';
export { AnnotationToolbar } from './components/AnnotationToolbar';
export { AreaSelector } from './components/AreaSelector';
export { StylePicker } from './components/StylePicker';
export { ToolButton } from './components/ToolButton';
export { TextEditorOverlay } from './components/TextEditorOverlay';
export { ExportPanel } from './components/ExportPanel';

// Style injection
export { injectAnnotationKitStyles, removeAnnotationKitStyles } from './styles/inject';