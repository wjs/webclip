// IObjectDrawer — tool interface for creating and manipulating fabric shapes
// Improved from original: no resizeByTwoPoint (resize handled by fabric Controls),
// no setPenStyle (pen uses freeDrawingBrush directly)

import { fabric } from 'fabric';
import { ToolType, DrawingStyle } from '../types';

export type { DrawingStyle };

export interface DrawerOptions extends DrawingStyle {
  originX: number;
  originY: number;
}

export interface IObjectDrawer {
  toolType: ToolType;

  /** Create a new fabric shape at the given starting position */
  make(options: DrawerOptions): Promise<fabric.Object>;

  /** Update shape size during mouse drag */
  resize(
    object: fabric.Object,
    currentX: number,
    currentY: number,
    originX: number,
    originY: number,
  ): void;

  /** Update visual style of an existing shape */
  updateStyle(object: fabric.Object, style: DrawingStyle): void;
}