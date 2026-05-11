// Type declarations for fabric.js — simplified version that works with fabric v5
// The @types/fabric package uses a nested namespace pattern (fabric.fabric.Canvas)
// that conflicts with `import { fabric } from 'fabric'`.
// This declaration file flattens the namespace for easier use.

declare module 'fabric' {
  export namespace fabric {
    class Canvas {
      constructor(el: HTMLElement | string, options?: any);
      add(obj: Object): Canvas;
      remove(obj: Object | Object[]): Canvas;
      renderAll(): Canvas;
      dispose(): void;
      getActiveObject(): Object | null;
      discardActiveObject(): Canvas;
      setActiveObject(obj: Object): Canvas;
      getObjects(): Object[];
      getPointer(e: Event): { x: number; y: number };
      getZoom(): number;
      setZoom(value: number): Canvas;
      setWidth(value: number): Canvas;
      setHeight(value: number): Canvas;
      getWidth(): number;
      getHeight(): number;
      toJSON(propertiesToInclude?: string[]): object;
      loadFromJSON(json: object, callback?: () => void, reviver?: Function): Canvas;
      isDrawingMode: boolean;
      freeDrawingBrush: PencilBrush;
      defaultCursor: string;
      selection: boolean;
      on(event: string, handler: (e: IEvent) => void): Canvas;
      off(event: string, handler?: (e: IEvent) => void): Canvas;
    }

    class StaticCanvas {
      constructor(el: HTMLElement | string, options?: any);
      renderAll(): StaticCanvas;
      dispose(): void;
      toJSON(propertiesToInclude?: string[]): object;
      loadFromJSON(json: object, callback?: () => void): StaticCanvas;
    }

    class Object {
      type: string;
      left: number;
      top: number;
      width: number;
      height: number;
      visible: boolean;
      stroke: string;
      strokeWidth: number;
      fill: string;
      selectable: boolean;
      evented: boolean;
      hasControls: boolean;
      hasBorders: boolean;
      objectCaching: boolean;
      oid: string;
      toolType: string;
      set(options: Partial<Object> | Record<string, unknown>): Object;
      setCoords(): Object;
      get(property: string): unknown;
      toObject(propertiesToInclude?: string[]): object;
    }

    class Rect extends Object {
      constructor(options?: any);
      rx: number;
      ry: number;
    }

    class Ellipse extends Object {
      constructor(options?: any);
      rx: number;
      ry: number;
    }

    class Line extends Object {
      constructor(points: number[], options?: any);
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }

    class LineArrow extends Line {
      constructor(points: number[], options?: any);
      static fromObject: (object: any, callback: (obj: Object) => void) => void;
      static async: boolean;
    }

    class IText extends Object {
      constructor(text: string, options?: any);
      text: string;
      fontSize: number;
      fontFamily: string;
      fill: string;
      borderColor: string;
      editingBorderColor: string;
      isEditing: boolean;
      enterEditing(): IText;
      exitEditing(): IText;
    }

    class Label extends IText {
      constructor(text: string, options?: any);
      static fromObject: (object: any, callback: (obj: Object) => void) => void;
      static async: boolean;
    }

    class PencilBrush {
      constructor(canvas: Canvas);
      color: string;
      width: number;
    }

    interface IEvent {
      e: Event;
      target?: Object;
      selected?: Object[];
    }

    interface ILineOptions {
      x1?: number;
      y1?: number;
      x2?: number;
      y2?: number;
      stroke?: string;
      strokeWidth?: number;
    }

    interface ITextOptions {
      text?: string;
      left?: number;
      top?: number;
      fontSize?: number;
      fontFamily?: string;
      fill?: string;
      borderColor?: string;
      editingBorderColor?: string;
      hasBorders?: boolean;
      strokeWidth?: number;
      objectCaching?: boolean;
      perPixelTargetFind?: boolean;
    }

    interface IObjectOptions {
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      stroke?: string;
      strokeWidth?: number;
      fill?: string;
      hasControls?: boolean;
      hasBorders?: boolean;
      objectCaching?: boolean;
      strokeLineCap?: string;
      strokeLineJoin?: string;
    }

    const util: {
      object: {
        extend(obj: any, ...sources: any[]): any;
      };
      createClass(parent: any, definition: any): any;
    };
  }

  export = fabric;
}