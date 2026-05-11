import { fabric } from 'fabric';
import { ToolType } from '../types';
import type { IObjectDrawer, DrawerOptions, DrawingStyle } from './IObjectDrawer';

// PenDrawer uses fabric's built-in freeDrawingMode.
// make() is not called — the canvas creates PencilBrush paths automatically.
// This class exists mainly for the IObjectDrawer interface contract
// and for updateStyle (which updates freeDrawingBrush settings).

export class PenDrawer implements IObjectDrawer {
  toolType = ToolType.Pen;

  async make(_options: DrawerOptions): Promise<fabric.Object> {
    // Pen mode uses canvas.isDrawingMode, not manual object creation
    // Returns a placeholder that won't be rendered
    throw new Error(
      'PenDrawer.make() should not be called — pen uses canvas.isDrawingMode',
    );
  }

  resize(): void {
    // Free-drawn paths cannot be resized during creation
  }

  updateStyle(object: fabric.Object, style: DrawingStyle): void {
    // This method updates the freeDrawingBrush when pen tool is active.
    // The AnnotationCanvas class handles brush setup via setDrawingMode().
    // For selected pen paths, update stroke properties:
    object.set({
      stroke: style.color,
      strokeWidth: style.weight,
    });
  }
}