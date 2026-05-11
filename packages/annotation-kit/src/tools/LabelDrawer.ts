import { fabric } from 'fabric';
import { ToolType } from '../types';
import type { IObjectDrawer, DrawerOptions, DrawingStyle } from './IObjectDrawer';

const ITEXT_DEFAULTS = {
  padding: 4,
  editingBorderColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  fontFamily: 'Inter',
};

// Label text color is inverted from the fill color for contrast
// against the colored callout background
function invertLabelTextColor(color: string): string {
  return color === '#FFFFFF' ? '#000000' : '#FFFFFF';
}

export class LabelDrawer implements IObjectDrawer {
  toolType = ToolType.Label;

  async make(options: DrawerOptions): Promise<fabric.Object> {
    // fabric.Label is registered by Label.ts custom shape
    const label = new fabric.Label('', {
      left: options.originX,
      top: options.originY,
      fontSize: options.fontSize,
      fill: invertLabelTextColor(options.color),
      borderColor: options.color,
      editingBorderColor: options.color,
      hasBorders: true,
      strokeWidth: 0,
      objectCaching: false,
      perPixelTargetFind: false,
      fontFamily: 'Inter',
      padding: 4,
    });
    return label;
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
      fill: invertLabelTextColor(style.color),
      fontSize: style.fontSize,
      borderColor: style.color,
      editingBorderColor: style.color,
    });
  }
}