// Clean naming — no typos (Operation, not Operatioin; CustomProperty, not CustomPropery)

export enum ToolType {
  Rect = 'RECT',
  Circle = 'CIRCLE',
  Arrow = 'ARROW',
  Text = 'TEXT',
  Label = 'LABEL',
  Pen = 'PEN',
  Select = 'SELECT', // replaces original's 'Review' — clearer name
  Delete = 'DELETE',
}

export const enum CursorMode {
  Draw = 'DRAW',
  Select = 'SELECT',
}

export const enum OperationType {
  Add = 'ADD',
  Modify = 'MODIFY',
  Move = 'MOVE',
  Resize = 'RESIZE',
  Remove = 'REMOVE',
  StyleChange = 'STYLE_CHANGE',
}

export interface DrawingStyle {
  color: string;
  weight: number;
  fontSize: number;
}

export interface Operation {
  type: OperationType;
  objectId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

// Properties to include when serializing fabric objects via toJSON()
export const CustomProperty = [
  'oid',
  'toolType',
  'hasControls',
  'hasBorders',
  'selectable',
  'perPixelTargetFind',
  'objectCaching',
  'pointerX',
  'pointerY',
];

// Enum for resize handle directions (used if custom controls are needed)
export enum Direction {
  nw = 'nw',
  ne = 'ne',
  se = 'se',
  sw = 'sw',
}

// --- Screenshot provider (decoupled from Chrome APIs) ---
export interface ScreenshotProvider {
  /** Request a full-viewport screenshot and return its data URL */
  captureScreenshot(): Promise<string | null>;
}

export interface ExportConfig {
  screenshotProvider: ScreenshotProvider;
  filePrefix?: string;
}