import { fabric } from 'fabric';
import { ToolType } from '../types';
import type { IObjectDrawer, DrawerOptions, DrawingStyle } from './IObjectDrawer';

export class CircleDrawer implements IObjectDrawer {
  toolType = ToolType.Circle;

  async make(options: DrawerOptions): Promise<fabric.Object> {
    const ellipse = new fabric.Ellipse({
      left: options.originX,
      top: options.originY,
      rx: 0,
      ry: 0,
      stroke: options.color,
      strokeWidth: options.weight,
      fill: 'transparent',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });
    return ellipse;
  }

  resize(
    object: fabric.Object,
    currentX: number,
    currentY: number,
    originX: number,
    originY: number,
  ): void {
    const left = Math.min(originX, currentX);
    const top = Math.min(originY, currentY);
    const rx = Math.abs(currentX - originX) / 2;
    const ry = Math.abs(currentY - originY) / 2;

    object.set({ left, top, rx, ry } as Partial<fabric.Ellipse>);
    object.setCoords();
  }

  updateStyle(object: fabric.Object, style: DrawingStyle): void {
    object.set({
      stroke: style.color,
      strokeWidth: style.weight,
      fill: 'transparent',
    });
  }
}