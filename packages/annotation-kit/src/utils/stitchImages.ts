/**
 * Crop a full-viewport screenshot to a selected rect, accounting for devicePixelRatio.
 * Returns an offscreen canvas with just the cropped region.
 */
export async function cropScreenshot(
  dataUrl: string,
  rect: { x: number; y: number; width: number; height: number },
  dpr: number,
): Promise<HTMLCanvasElement | null> {
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
  if (!img.width || !img.height) return null;

  const scaleX = img.width / window.innerWidth;
  const scaleY = img.height / window.innerHeight;

  const cropW = Math.round(rect.width * scaleX);
  const cropH = Math.round(rect.height * scaleY);
  const cropX = Math.round(rect.x * scaleX);
  const cropY = Math.round(rect.y * scaleY);

  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return canvas;
}

/**
 * Stitch multiple cropped canvas segments vertically into one tall image.
 * Optionally overlay annotations on the first segment.
 * Returns the final merged data URL.
 */
export function stitchVertically(
  segments: HTMLCanvasElement[],
  annotationCanvasEl?: HTMLCanvasElement | null,
): string | null {
  if (segments.length === 0) return null;

  const width = segments[0].width;
  const totalHeight = segments.reduce((sum, s) => sum + s.height, 0);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw each segment vertically
  let yOffset = 0;
  for (const segment of segments) {
    ctx.drawImage(segment, 0, yOffset);
    yOffset += segment.height;
  }

  // Overlay annotations on the first segment area
  if (annotationCanvasEl) {
    ctx.drawImage(
      annotationCanvasEl,
      0,
      0,
      annotationCanvasEl.width,
      annotationCanvasEl.height,
      0,
      0,
      annotationCanvasEl.width,
      segments[0].height,
    );
  }

  return canvas.toDataURL('image/png');
}