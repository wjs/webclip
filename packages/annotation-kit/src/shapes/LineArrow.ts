// Custom fabric.LineArrow — improved from original
// - Cleaner _render with documented arrowhead math
// - Proper fromObject for undo/redo deserialization
// - Uses fabric Controls API (not custom Circle/Line handles)
// - toObject uses CustomProperty (clean naming, no typo)

import { fabric } from 'fabric';
import { CustomProperty } from '../types';

fabric.LineArrow = fabric.util.createClass(fabric.Line, {
  type: 'lineArrow',

  initialize: function (element: any, options: any) {
    options = options || {};
    this.callSuper('initialize', element, options);
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
    this.callSuper('_render', ctx);

    // Skip if zero-length or invisible
    if (this.width === 0 && this.height === 0 || !this.visible) return;

    ctx.save();

    // Calculate arrow direction
    const xDiff = this.x2 - this.x1;
    const yDiff = this.y2 - this.y1;
    const angle = Math.atan2(yDiff, xDiff);

    // Translate to line midpoint, rotate to line angle
    ctx.translate(xDiff / 2, yDiff / 2);
    ctx.rotate(angle);

    // Draw arrowhead triangle
    // Arrowhead points: tip at strokeWidth*1.6 ahead of line end,
    // two base corners at strokeWidth*3 behind, offset by strokeWidth*2.4
    ctx.beginPath();
    ctx.moveTo(this.strokeWidth * 1.6, 0);
    ctx.lineTo(-this.strokeWidth * 3, this.strokeWidth * 2.4);
    ctx.lineTo(-this.strokeWidth * 3, -this.strokeWidth * 2.4);
    ctx.closePath();

    // Fill arrowhead with same color as line stroke
    ctx.fillStyle = this.stroke;
    ctx.fill();

    ctx.restore();
  },
});

// Deserialization for undo/redo and loadFromJSON
fabric.LineArrow.fromObject = function (
  object: fabric.ILineOptions & Record<string, unknown>,
  callback: (obj: fabric.Object) => void,
) {
  callback(
    new fabric.LineArrow(
      [object.x1!, object.y1!, object.x2!, object.y2!],
      object,
    ),
  );
};

fabric.LineArrow.async = true;