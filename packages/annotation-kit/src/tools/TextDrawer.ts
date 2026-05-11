import { fabric } from 'fabric';
import { ToolType } from '../types';
import type { IObjectDrawer, DrawerOptions, DrawingStyle } from './IObjectDrawer';

const ITEXT_DEFAULTS = {
  padding: 4,
  editingBorderColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  fontFamily: 'Inter',
};

export class TextDrawer implements IObjectDrawer {
  toolType = ToolType.Text;

  async make(options: DrawerOptions): Promise<fabric.Object> {
    const text = new fabric.IText('', {
      left: options.originX,
      top: options.originY,
      fontSize: options.fontSize,
      fill: options.color,
      ...ITEXT_DEFAULTS,
      hasBorders: true,
      editingBorderColor: options.color,
      borderColor: options.color,
      strokeWidth: 0,
      perPixelTargetFind: false,
      objectCaching: false,
    });
    return text;
  }

  resize(
    object: fabric.Object,
    currentX: number,
    currentY: number,
  ): void {
    object.set({ left: currentX, top: currentY });
    object.setCoords();
  }

  updateStyle(object: fabric.Object, style: DrawingStyle): void {
    (object as any).set({
      fill: style.color,
      fontSize: style.fontSize,
      editingBorderColor: style.color,
      borderColor: style.color,
    });
  }
}