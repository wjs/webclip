// AnnotationCanvas — fabric.Canvas wrapper class (NOT singleton)
// Created per annotation session, destroyed when overlay is removed.
// Bridges fabric.Canvas ↔ Zustand annotationStore.

import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import { useAnnotationStore } from './store/annotationStore';
import { UndoRedoManager } from './undo/UndoRedoManager';
import { ToolType, CustomProperty } from './types';
import { RectDrawer } from './tools/RectDrawer';
import { CircleDrawer } from './tools/CircleDrawer';
import { ArrowDrawer } from './tools/ArrowDrawer';
import { TextDrawer } from './tools/TextDrawer';
import { LabelDrawer } from './tools/LabelDrawer';
import { PenDrawer } from './tools/PenDrawer';
import type { IObjectDrawer } from './tools/IObjectDrawer';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from './constants';

export class AnnotationCanvas {
  private canvas: fabric.Canvas;
  private undoRedoManager: UndoRedoManager;
  private drawers: Map<ToolType, IObjectDrawer>;
  private currentDrawer: IObjectDrawer | null = null;
  private drawingOrigin: { x: number; y: number } | null = null;
  private currentObject: fabric.Object | null = null;
  private isDrawing = false;

  // Bound event handlers (stored for cleanup)
  private boundMouseDown: (e: fabric.IEvent) => void;
  private boundMouseMove: (e: fabric.IEvent) => void;
  private boundMouseUp: (e: fabric.IEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundObjectSelected: (e: fabric.IEvent) => void;
  private boundSelectionCleared: () => void;

  constructor(container: HTMLElement, canvasWidth?: number, canvasHeight?: number) {
    // Create canvas element inside container
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'ak-canvas';
    container.appendChild(canvasEl);

    const width = canvasWidth || DEFAULT_CANVAS_WIDTH;
    const height = canvasHeight || DEFAULT_CANVAS_HEIGHT;

    this.canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      selection: true,
      backgroundColor: 'transparent',
    });

    this.undoRedoManager = new UndoRedoManager();

    // Initialize drawers
    this.drawers = new Map([
      [ToolType.Rect, new RectDrawer()],
      [ToolType.Circle, new CircleDrawer()],
      [ToolType.Arrow, new ArrowDrawer()],
      [ToolType.Text, new TextDrawer()],
      [ToolType.Label, new LabelDrawer()],
      [ToolType.Pen, new PenDrawer()],
    ]);

    // Bind event handlers (so we can remove them later)
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundObjectSelected = this.onObjectSelected.bind(this);
    this.boundSelectionCleared = this.onSelectionCleared.bind(this);

    this.initEventListeners();
    this.adjustCanvasZoom(container);

    // Mark ready after init completes
    useAnnotationStore.getState().setReady(true);
    useAnnotationStore.getState().setUndoRedoState(
      this.undoRedoManager.canUndo,
      this.undoRedoManager.canRedo,
    );
  }

  private initEventListeners(): void {
    this.canvas.on('mouse:down', this.boundMouseDown);
    this.canvas.on('mouse:move', this.boundMouseMove);
    this.canvas.on('mouse:up', this.boundMouseUp);
    this.canvas.on('selection:created', this.boundObjectSelected);
    this.canvas.on('selection:updated', this.boundObjectSelected);
    this.canvas.on('selection:cleared', this.boundSelectionCleared);
    window.addEventListener('keydown', this.boundKeyDown);
  }

  private removeEventListeners(): void {
    this.canvas.off('mouse:down', this.boundMouseDown);
    this.canvas.off('mouse:move', this.boundMouseMove);
    this.canvas.off('mouse:up', this.boundMouseUp);
    this.canvas.off('selection:created', this.boundObjectSelected);
    this.canvas.off('selection:updated', this.boundObjectSelected);
    this.canvas.off('selection:cleared', this.boundSelectionCleared);
    window.removeEventListener('keydown', this.boundKeyDown);
  }

  /** Scale canvas to fit container width */
  adjustCanvasZoom(container: HTMLElement): void {
    const containerWidth = container.clientWidth || window.innerWidth;
    const zoom = containerWidth / this.canvas.getWidth();
    this.canvas.setZoom(zoom);
    this.canvas.setWidth(containerWidth);
    this.canvas.setHeight((this.canvas.getHeight() || DEFAULT_CANVAS_HEIGHT) * zoom);
    this.canvas.renderAll();
  }

  /** Switch drawing mode based on active tool */
  setDrawingMode(tool: ToolType): void {
    const store = useAnnotationStore.getState();
    const style = store.style;

    // Disable free drawing mode first
    this.canvas.isDrawingMode = false;

    // Reset drawing state
    this.currentDrawer = null;
    this.drawingOrigin = null;
    this.currentObject = null;

    if (tool === ToolType.Select) {
      // Select mode: enable selection, disable drawing
      this.canvas.selection = true;
      this.canvas.defaultCursor = 'default';
      this.setObjectsSelectable(true);
    } else if (tool === ToolType.Delete) {
      this.canvas.selection = false;
      this.canvas.defaultCursor = 'default';
      this.setObjectsSelectable(true);
    } else if (tool === ToolType.Pen) {
      // Pen mode: use fabric's free drawing
      this.canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(this.canvas);
      brush.color = style.color;
      brush.width = style.weight;
      this.canvas.freeDrawingBrush = brush;
      this.canvas.selection = false;
      this.setObjectsSelectable(false);
    } else {
      // Shape tools: custom drawing mode
      const drawer = this.drawers.get(tool);
      if (drawer) {
        this.currentDrawer = drawer;
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'crosshair';
        this.setObjectsSelectable(false);
      }
    }

    this.canvas.renderAll();
  }

  /** Update style of freeDrawingBrush or selected object */
  updateStyle(): void {
    const store = useAnnotationStore.getState();
    const { activeTool, style } = store;
    const zoom = this.canvas.getZoom();

    if (activeTool === ToolType.Pen && this.canvas.isDrawingMode) {
      const brush = this.canvas.freeDrawingBrush as fabric.PencilBrush;
      brush.color = style.color;
      brush.width = style.weight / zoom;
    }

    // Update selected object's style
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        stroke: style.color,
        strokeWidth: style.weight / zoom,
        fill: 'transparent',
      });
      if (activeObject instanceof fabric.IText) {
        activeObject.set({
          fontSize: style.fontSize / zoom,
          fill: style.color,
        });
      }
      this.canvas.renderAll();
      this.pushUndoSnapshot();
    }
  }

  // --- Mouse event handlers ---
  private onMouseDown(e: fabric.IEvent): void {
    const store = useAnnotationStore.getState();
    const { activeTool } = store;

    if (activeTool === ToolType.Delete) {
      // Delete selected objects
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.pushUndoSnapshot();
        this.canvas.remove(activeObject);
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
      return;
    }

    if (activeTool === ToolType.Select || activeTool === ToolType.Pen) {
      return; // fabric handles these
    }

    if (!this.currentDrawer) return;

    const pointer = this.canvas.getPointer(e.e);
    this.drawingOrigin = { x: pointer.x, y: pointer.y };

    const drawer = this.currentDrawer;
    const style = store.style;
    const zoom = this.canvas.getZoom();

    drawer.make({
      color: style.color,
      weight: style.weight / zoom,
      fontSize: style.fontSize / zoom,
      originX: pointer.x,
      originY: pointer.y,
    }).then((obj) => {
      if (!obj) return;
      obj.set({ oid: nanoid(), toolType: drawer.toolType } as Partial<fabric.Object>);
      this.canvas.add(obj);
      this.currentObject = obj;
      this.isDrawing = true;

      // Text/Label: enter editing mode AFTER adding to canvas (needs canvas reference)
      if (drawer.toolType === ToolType.Text || drawer.toolType === ToolType.Label) {
        if (obj instanceof fabric.IText) {
          obj.enterEditing();
          this.canvas.setActiveObject(obj);
        }
      }

      this.canvas.renderAll();
    });
  }

  private onMouseMove(e: fabric.IEvent): void {
    if (!this.isDrawing || !this.currentDrawer || !this.currentObject || !this.drawingOrigin) {
      return;
    }

    const pointer = this.canvas.getPointer(e.e);
    this.currentDrawer.resize(
      this.currentObject,
      pointer.x,
      pointer.y,
      this.drawingOrigin.x,
      this.drawingOrigin.y,
    );
    this.canvas.renderAll();
  }

  private onMouseUp(e: fabric.IEvent): void {
    if (!this.isDrawing) return;

    this.isDrawing = false;

    // Discard zero-size shapes
    if (this.currentObject) {
      const obj = this.currentObject;
      if (
        (obj instanceof fabric.Rect || obj instanceof fabric.Ellipse) &&
        (obj.width === 0 || obj.height === 0)
      ) {
        this.canvas.remove(obj);
      } else {
        this.pushUndoSnapshot();
      }
    }

    this.currentObject = null;
    this.drawingOrigin = null;
    this.canvas.renderAll();
  }

  // --- Keyboard handler ---
  private onKeyDown(e: KeyboardEvent): void {
    // Undo: Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    }
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      this.redo();
    }
    // Delete: Delete key
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && !(activeObject instanceof fabric.IText && activeObject.isEditing)) {
        e.preventDefault();
        this.pushUndoSnapshot();
        this.canvas.remove(activeObject);
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    }
    // Escape: close overlay
    if (e.key === 'Escape') {
      // The OverlayContainer handles closing — this just deselects
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }

  // --- Selection handlers ---
  private onObjectSelected(e: fabric.IEvent): void {
    const selected = e.selected?.[0];
    if (!selected) return;
    const store = useAnnotationStore.getState();
    store.selectObject(
      (selected as any).oid,
      (selected as any).toolType,
    );
  }

  private onSelectionCleared(): void {
    useAnnotationStore.getState().selectObject(null, null);
  }

  // --- Undo/Redo ---
  private pushUndoSnapshot(): void {
    this.undoRedoManager.pushSnapshot(this.canvas);
    useAnnotationStore.getState().setUndoRedoState(
      this.undoRedoManager.canUndo,
      this.undoRedoManager.canRedo,
    );
  }

  undo(): void {
    if (this.undoRedoManager.undo(this.canvas)) {
      useAnnotationStore.getState().setUndoRedoState(
        this.undoRedoManager.canUndo,
        this.undoRedoManager.canRedo,
      );
    }
  }

  redo(): void {
    if (this.undoRedoManager.redo(this.canvas)) {
      useAnnotationStore.getState().setUndoRedoState(
        this.undoRedoManager.canUndo,
        this.undoRedoManager.canRedo,
      );
    }
  }

  // --- Helpers ---
  private setObjectsSelectable(selectable: boolean): void {
    this.canvas.getObjects().forEach((obj) => {
      obj.set({ selectable, evented: selectable } as Partial<fabric.Object>);
    });
  }

  /** Clear all annotation objects (keep canvas alive) */
  clearObjects(): void {
    this.canvas.getObjects().forEach((obj) => this.canvas.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    this.undoRedoManager.reset();
    useAnnotationStore.getState().setUndoRedoState(false, false);
  }

  /** Get JSON representation of all annotations */
  getJSON(): string {
    return JSON.stringify(this.canvas.toJSON(CustomProperty));
  }

  /** Load annotations from JSON string */
  loadFromJSON(json: string): Promise<void> {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(JSON.parse(json), () => {
        this.canvas.renderAll();
        resolve();
      });
    });
  }

  /** Destroy canvas and remove all listeners — guaranteed cleanup */
  destroy(): void {
    this.removeEventListeners();
    this.clearObjects();
    this.canvas.dispose();
    useAnnotationStore.getState().resetCanvas();
  }

  /** Get the fabric.Canvas instance (for external use like export) */
  getCanvas(): fabric.Canvas {
    return this.canvas;
  }
}