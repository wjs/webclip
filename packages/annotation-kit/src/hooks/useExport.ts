import { useScreenshotProvider } from '../context/ScreenshotContext';

// Export hook — handles screenshot capture, annotation merge, and file export
// Uses ScreenshotProvider (injected via React Context) instead of Chrome APIs directly

export function useExport(filePrefix = 'annotation') {
  const screenshotProvider = useScreenshotProvider();

  const requestScreenshot = (): Promise<string | null> => {
    return screenshotProvider.captureScreenshot();
  };

  /**
   * Export the selected area with annotations as PNG.
   * @param selectedRect - The selected area in viewport coordinates {x, y, width, height}
   * @param annotationCanvasEl - The fabric canvas HTML element (for drawing annotation layer)
   * @param canvasZoom - The zoom factor of the annotation canvas
   */
  const exportSelectedAreaPng = async (
    selectedRect: { x: number; y: number; width: number; height: number },
    annotationCanvasEl: HTMLCanvasElement | null,
    canvasZoom: number,
  ): Promise<boolean> => {
    const screenshotDataUrl = await requestScreenshot();
    if (!screenshotDataUrl) return false;

    // Create offscreen canvas sized to the selected area
    const offscreen = document.createElement('canvas');
    const ctx = offscreen.getContext('2d');
    if (!ctx) return false;

    // Load screenshot image (full viewport capture)
    const img = new Image();
    img.src = screenshotDataUrl;
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });

    // Scale factor: capture returns image at device pixel ratio
    const scaleX = img.width / window.innerWidth;
    const scaleY = img.height / window.innerHeight;

    // Crop the selected area from the full screenshot
    offscreen.width = Math.round(selectedRect.width * scaleX);
    offscreen.height = Math.round(selectedRect.height * scaleY);

    // Draw cropped screenshot as background
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

    // Draw annotation layer on top, scaled to match the cropped area
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

    // Download merged result
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

    const offscreen = document.createElement('canvas');
    const ctx = offscreen.getContext('2d');
    if (!ctx) return false;

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

  return { exportSelectedAreaPng, copyToClipboard, exportJson };
}