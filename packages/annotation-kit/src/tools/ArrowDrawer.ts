import { fabric } from 'fabric';
import { ToolType } from '../types';
import type { IObjectDrawer, DrawerOptions, DrawingStyle } from './IObjectDrawer';

export class ArrowDrawer implements IObjectDrawer {
  toolType = ToolType.Arrow;

  async make(options: DrawerOptions): Promise<fabric.Object> {
    // fabric.LineArrow is registered by LineArrow.ts custom shape
    const arrow = new fabric.LineArrow(
      [options.originX, options.originY, options.originX + 1, options.originY + 1],
      {
        stroke: options.color,
        strokeWidth: options.weight,
        strokeLineCap: 'round',
        hasControls: true,
        hasBorders: true,
        objectCaching: false,
      },
    );
    return arrow;
  }

  resize(
    object: fabric.Object,
    currentX: number,
    currentY: number,
    _originX: number,
    _originY: number,
  ): void {
    const line = object as fabric.Line;
    line.set({ x2: currentX, y2: currentY });
    line.setCoords();
  }

  updateStyle(object: fabric.Object, style: DrawingStyle): void {
    object.set({
      stroke: style.color,
      strokeWidth: style.weight,
    });
  }
}