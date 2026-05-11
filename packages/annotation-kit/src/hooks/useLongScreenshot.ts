import { useState, useRef, useCallback } from 'react';
import { useScreenshotProvider } from '../context/ScreenshotContext';
import { cropScreenshot, stitchVertically } from '../utils/stitchImages';
import type { LongScreenshotOptions, LongScreenshotResult, LongScreenshotProgress } from '../types';

const DEFAULT_MAX_STEPS = 50;
const SCROLL_DELAY_MS = 150;

export function useLongScreenshot() {
  const screenshotProvider = useScreenshotProvider();
  const [progress, setProgress] = useState<LongScreenshotProgress>({
    currentStep: 0,
    totalSteps: 0,
    isCapturing: false,
  });
  const stopRequestedRef = useRef(false);
  const abortRef = useRef(false);

  const startLongScreenshot = useCallback(
    async (
      options: LongScreenshotOptions,
      annotationCanvasEl: HTMLCanvasElement | null,
    ): Promise<LongScreenshotResult | null> => {
      const { selectedRect, scrollStep, maxSteps = DEFAULT_MAX_STEPS } = options;

      if (!screenshotProvider.captureScreenshotAtScroll) {
        console.error('captureScreenshotAtScroll not provided by ScreenshotProvider');
        return null;
      }

      stopRequestedRef.current = false;
      abortRef.current = false;
      setProgress({ currentStep: 0, totalSteps: 0, isCapturing: true });

      const segments: HTMLCanvasElement[] = [];
      const initialScrollY = window.scrollY;

      // Step 0: capture the first viewport (already visible)
      const firstDataUrl = await screenshotProvider.captureScreenshotAtScroll(initialScrollY);
      if (!firstDataUrl) {
        setProgress({ currentStep: 0, totalSteps: 0, isCapturing: false });
        return null;
      }

      const firstCrop = await cropScreenshot(firstDataUrl, selectedRect, window.devicePixelRatio);
      if (!firstCrop) {
        setProgress({ currentStep: 0, totalSteps: 0, isCapturing: false });
        return null;
      }
      segments.push(firstCrop);
      setProgress({ currentStep: 1, totalSteps: 1, isCapturing: true });

      // Scroll and capture subsequent steps
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      let currentScrollY = initialScrollY;
      let step = 1;

      while (step < maxSteps && !stopRequestedRef.current && !abortRef.current) {
        currentScrollY += scrollStep;

        // Stop if we've reached or passed the page bottom
        if (currentScrollY + viewportHeight >= pageHeight) {
          // Final step: capture what's remaining at the bottom
          const finalDataUrl = await screenshotProvider.captureScreenshotAtScroll(currentScrollY);
          if (finalDataUrl) {
            const finalCrop = await cropScreenshot(finalDataUrl, selectedRect, window.devicePixelRatio);
            if (finalCrop) {
              segments.push(finalCrop);
              step++;
              setProgress({ currentStep: step, totalSteps: step, isCapturing: true });
            }
          }
          break;
        }

        const dataUrl = await screenshotProvider.captureScreenshotAtScroll(currentScrollY);
        if (!dataUrl) break;

        const crop = await cropScreenshot(dataUrl, selectedRect, window.devicePixelRatio);
        if (!crop) break;

        segments.push(crop);
        step++;
        setProgress({ currentStep: step, totalSteps: step, isCapturing: true });
      }

      // Stitch all segments
      const dataUrl = stitchVertically(segments, annotationCanvasEl);

      setProgress({ currentStep: step, totalSteps: step, isCapturing: false });

      if (!dataUrl) return null;

      // Calculate result dimensions
      const totalHeight = segments.reduce((sum, s) => sum + s.height, 0);
      const width = segments[0]?.width ?? 0;

      return { dataUrl, steps: step, width, height: totalHeight };
    },
    [screenshotProvider],
  );

  const stopLongScreenshot = useCallback(() => {
    stopRequestedRef.current = true;
  }, []);

  const abortLongScreenshot = useCallback(() => {
    abortRef.current = true;
    stopRequestedRef.current = true;
    setProgress({ currentStep: 0, totalSteps: 0, isCapturing: false });
  }, []);

  return { startLongScreenshot, stopLongScreenshot, abortLongScreenshot, progress };
}