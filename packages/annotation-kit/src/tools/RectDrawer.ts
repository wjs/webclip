import { fabric } from 'fabric';
import { ToolType } from '../types';
import type { IObjectDrawer, DrawerOptions, DrawingStyle } from './IObjectDrawer';

export class RectDrawer implements IObjectDrawer {
  toolType = ToolType.Rect;

  async make(options: DrawerOptions): Promise<fabric.Object> {
    const rect = new fabric.Rect({
      left: options.originX,
      top: options.originY,
      width: 0,
      height: 0,
      stroke: options.color,
      strokeWidth: options.weight,
      fill: 'transparent',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });
    return rect;
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
    const width = Math.abs(currentX - originX);
    const height = Math.abs(currentY - originY);

    object.set({ left, top, width, height });
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