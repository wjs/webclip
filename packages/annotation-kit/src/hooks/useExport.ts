import { useScreenshotProvider } from '../context/ScreenshotContext';

// Export hook — handles screenshot capture, annotation merge, and file export
// Uses ScreenshotProvider (injected via React Context) instead of Chrome APIs directly

/** Composite screenshot + annotations onto an offscreen canvas, return the canvas */
async function compositeMerged(
  screenshotDataUrl: string,
  selectedRect: { x: number; y: number; width: number; height: number },
  annotationCanvasEl: HTMLCanvasElement | null,
): Promise<HTMLCanvasElement | null> {
  const offscreen = document.createElement('canvas');
  const ctx = offscreen.getContext('2d');
  if (!ctx) return null;

  const img = new Image();
  img.src = screenshotDataUrl;
  await new Promise<void>((resolve) => { img.onload = () => resolve(); });

  const scaleX = img.width / window.innerWidth;
  const scaleY = img.height / window.innerHeight;

  offscreen.width = Math.round(selectedRect.width * scaleX);
  offscreen.height = Math.round(selectedRect.height * scaleY);

  ctx.drawImage(
    img,
    Math.round(selectedRect.x * scaleX),
    Math.round(selectedRect.y * scaleY),
    offscreen.width,
    offscreen.height,
    0,
    0,
    offscreen.width,
    offscreen.height,
  );

  if (annotationCanvasEl) {
    ctx.drawImage(
      annotationCanvasEl,
      0,
      0,
      annotationCanvasEl.width,
      annotationCanvasEl.height,
      0,
      0,
      offscreen.width,
      offscreen.height,
    );
  }

  return offscreen;
}

export function useExport(filePrefix = 'annotation') {
  const screenshotProvider = useScreenshotProvider();

  const requestScreenshot = (): Promise<string | null> => {
    return screenshotProvider.captureScreenshot();
  };

  /**
   * Get the merged PNG data URL (screenshot + annotations) without saving or copying.
   */
  const getMergedDataUrl = async (
    selectedRect: { x: number; y: number; width: number; height: number },
    annotationCanvasEl: HTMLCanvasElement | null,
    canvasZoom: number,
  ): Promise<string | null> => {
    const screenshotDataUrl = await requestScreenshot();
    if (!screenshotDataUrl) return null;

    const offscreen = await compositeMerged(screenshotDataUrl, selectedRect, annotationCanvasEl);
    if (!offscreen) return null;

    return offscreen.toDataURL('image/png');
  };

  const exportSelectedAreaPng = async (
    selectedRect: { x: number; y: number; width: number; height: number },
    annotationCanvasEl: HTMLCanvasElement | null,
    canvasZoom: number,
  ): Promise<boolean> => {
    const screenshotDataUrl = await requestScreenshot();
    if (!screenshotDataUrl) return false;

    const offscreen = await compositeMerged(screenshotDataUrl, selectedRect, annotationCanvasEl);
    if (!offscreen) return false;

    const mergedDataUrl = offscreen.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filePrefix}-${Date.now()}.png`;
    link.href = mergedDataUrl;
    link.click();
    return true;
  };

  const copyToClipboard = async (
    selectedRect: { x: number; y: number; width: number; height: number },
    annotationCanvasEl: HTMLCanvasElement | null,
    canvasZoom: number,
  ): Promise<boolean> => {
    const screenshotDataUrl = await requestScreenshot();
    if (!screenshotDataUrl) return false;

    const offscreen = await compositeMerged(screenshotDataUrl, selectedRect, annotationCanvasEl);
    if (!offscreen) return false;

    const blob = await new Promise<Blob>((resolve) => {
      offscreen.toBlob((b) => resolve(b!), 'image/png');
    });

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  };

  const exportJson = (jsonString: string) => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${filePrefix}-${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return { exportSelectedAreaPng, copyToClipboard, exportJson, getMergedDataUrl };
}