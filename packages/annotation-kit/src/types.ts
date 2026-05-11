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
  /** Capture viewport screenshot at a specific scroll Y position (for long screenshots) */
  captureScreenshotAtScroll?(scrollY: number): Promise<string | null>;
}

export interface ExportConfig {
  screenshotProvider: ScreenshotProvider;
  filePrefix?: string;
}

// --- Long screenshot ---
export interface LongScreenshotOptions {
  /** Viewport rect to crop each capture to {x, y, width, height} */
  selectedRect: { x: number; y: number; width: number; height: number };
  /** Scroll step height (usually = selectedRect.height) */
  scrollStep: number;
  /** Max number of captures to prevent infinite scrolling (default: 50) */
  maxSteps?: number;
}

export interface LongScreenshotResult {
  /** Stitched image data URL */
  dataUrl: string;
  /** Number of segments captured */
  steps: number;
  /** Width of the result image (in pixels, at devicePixelRatio) */
  width: number;
  /** Height of the result image (in pixels, at devicePixelRatio) */
  height: number;
}

export interface LongScreenshotProgress {
  /** Current step number (1-based) */
  currentStep: number;
  /** Total steps captured so far */
  totalSteps: number;
  /** Whether capture is still in progress */
  isCapturing: boolean;
}