// Custom fabric.Label — callout with colored background + pointer
// Improved from original:
// - Cleaner _render with documented coordinate math
// - Proper fromObject for undo/redo deserialization
// - Uses CustomProperty (clean naming, no typo)
// - Better clamping for pointer triangle at large font sizes

import { fabric } from 'fabric';
import { CustomProperty } from '../types';

fabric.Label = fabric.util.createClass(fabric.IText, {
  type: 'label',

  initialize: function (text: string, options: any) {
    options = options || {};
    this.callSuper('initialize', text, options);
  },

  toObject: function () {
    return fabric.util.object.extend(
      this.callSuper('toObject'),
      CustomProperty.reduce(
        (cur: Record<string, unknown>, key: string) => ({ ...cur, [key]: this[key] }),
        {},
      ),
    );
  },

  _render: function (ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Background: rounded rectangle + pointer triangle
    ctx.fillStyle = this.borderColor; // borderColor = user's chosen color

    // Pointer triangle dimensions (clamped for large font sizes)
    const triangleW = Math.min(this.fontSize / 2, 32);
    const triangleH = Math.min(this.fontSize / 2.8, 25);
    const triangleTopOffset = this.fontSize;

    // Rounded rectangle position
    const bgLeft = -this.width / 2 - this.fontSize / 2;
    const bgTop = -12 - 20 - this.height / 2;
    const bgWidth = this.width + this.fontSize;
    const bgHeight = this.height + 60;
    const bgRadius = Math.min(10 + this.fontSize / 4, 20);

    ctx.beginPath();

    // Pointer triangle (left side of the callout)
    ctx.moveTo(bgLeft - triangleW, triangleTopOffset + bgTop);
    ctx.lineTo(bgLeft, triangleTopOffset + bgTop + triangleH);
    ctx.lineTo(bgLeft, triangleTopOffset + bgTop - triangleH);

    // Rounded rectangle (connected to pointer)
    ctx.roundRect(bgLeft, bgTop, bgWidth, bgHeight, [bgRadius]);

    ctx.fill();

    ctx.restore();

    // Render text on top of the background
    this.callSuper('_render', ctx);
  },
});

// Deserialization for undo/redo and loadFromJSON
fabric.Label.fromObject = function (
  object: fabric.ITextOptions & Record<string, unknown>,
  callback: (obj: fabric.Object) => void,
) {
  callback(new fabric.Label(object.text ?? '', object));
};

fabric.Label.async = true;