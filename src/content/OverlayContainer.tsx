import type {
  LongScreenshotProgress,
  LongScreenshotResult,
} from "annotation-kit";
import {
  AnnotationOverlay,
  AnnotationToolbar,
  AreaSelector,
  useExport,
  useLongScreenshot,
} from "annotation-kit";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface OverlayContainerProps {
  onClose: () => void;
}

type Phase = "selecting" | "annotating" | "longCapturing" | "longResult";

export const OverlayContainer: React.FC<OverlayContainerProps> = ({
  onClose,
}) => {
  const [phase, setPhase] = useState<Phase>("selecting");
  const [selectedRect, setSelectedRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [longResult, setLongResult] = useState<LongScreenshotResult | null>(
    null,
  );
  const [longProgress, setLongProgress] = useState<LongScreenshotProgress>({
    currentStep: 0,
    totalSteps: 0,
    isCapturing: false,
  });
  const annotationCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { exportSelectedAreaPng, copyToClipboard } = useExport("webclip");
  const {
    startLongScreenshot,
    stopLongScreenshot,
    abortLongScreenshot,
    progress,
  } = useLongScreenshot();

  // Sync long screenshot progress
  useEffect(() => {
    setLongProgress(progress);
  }, [progress]);

  // Lock page scroll while overlay is active (except during long screenshot capture)
  useEffect(() => {
    if (phase === "longCapturing") {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  const handleAreaSelected = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) => {
      setSelectedRect(rect);
      setPhase("annotating");
    },
    [],
  );

  const handleCancelSelection = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (phase === "longCapturing") {
      abortLongScreenshot();
    }
    onClose();
  }, [onClose, phase, abortLongScreenshot]);

  const handleReSelect = useCallback(() => {
    if (phase === "longCapturing") {
      abortLongScreenshot();
    }
    setPhase("selecting");
    setSelectedRect(null);
    setLongResult(null);
  }, [phase, abortLongScreenshot]);

  // ESC to close overlay at any phase (selecting phase handled by AreaSelector)
  useEffect(() => {
    if (phase === "selecting") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleClose]);

  const handleCopy = useCallback(async () => {
    if (!selectedRect || saving) return;
    setSaving(true);

    const canvasEl = document.querySelector(
      "#ak-canvas",
    ) as HTMLCanvasElement | null;
    const lowerCanvas = canvasEl?.parentElement?.querySelector(
      ".lower-canvas",
    ) as HTMLCanvasElement | null;
    const annotationCanvas = lowerCanvas || canvasEl;

    try {
      const ok = await copyToClipboard(selectedRect, annotationCanvas, 1);
      if (ok) onClose();
    } catch (err) {
      console.error("Copy failed:", err);
    }
    setSaving(false);
  }, [selectedRect, saving, copyToClipboard, onClose]);

  const handleSave = useCallback(async () => {
    if (!selectedRect || saving) return;
    setSaving(true);

    const canvasEl = document.querySelector(
      "#ak-canvas",
    ) as HTMLCanvasElement | null;
    const lowerCanvas = canvasEl?.parentElement?.querySelector(
      ".lower-canvas",
    ) as HTMLCanvasElement | null;
    const annotationCanvas = lowerCanvas || canvasEl;

    try {
      const ok = await exportSelectedAreaPng(selectedRect, annotationCanvas, 1);
      if (ok) onClose();
    } catch (err) {
      console.error("Export failed:", err);
    }
    setSaving(false);
  }, [selectedRect, saving, exportSelectedAreaPng, onClose]);

  // --- Long screenshot handlers ---
  const handleLongScreenshot = useCallback(async () => {
    if (!selectedRect) return;

    // Save annotation canvas reference before hiding overlay
    const canvasEl = document.querySelector(
      "#ak-canvas",
    ) as HTMLCanvasElement | null;
    const lowerCanvas = canvasEl?.parentElement?.querySelector(
      ".lower-canvas",
    ) as HTMLCanvasElement | null;
    annotationCanvasRef.current = lowerCanvas || canvasEl;

    setPhase("longCapturing");

    const result = await startLongScreenshot(
      {
        selectedRect,
        scrollStep: selectedRect.height,
        maxSteps: 50,
      },
      annotationCanvasRef.current,
    );

    if (result) {
      setLongResult(result);
      setPhase("longResult");
    } else {
      // Failed or aborted — go back to annotating
      setPhase("annotating");
    }
  }, [selectedRect, startLongScreenshot]);

  const handleStopLongScreenshot = useCallback(() => {
    stopLongScreenshot();
  }, [stopLongScreenshot]);

  // Save long screenshot result as PNG
  const handleSaveLong = useCallback(() => {
    if (!longResult) return;
    const link = document.createElement("a");
    link.download = `webclip-long-${Date.now()}.png`;
    link.href = longResult.dataUrl;
    link.click();
    onClose();
  }, [longResult, onClose]);

  // Copy long screenshot result to clipboard
  const handleCopyLong = useCallback(async () => {
    if (!longResult) return;
    setSaving(true);
    try {
      // Convert data URL to blob and copy
      const response = await fetch(longResult.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      onClose();
    } catch (err) {
      console.error("Copy long screenshot failed:", err);
    }
    setSaving(false);
  }, [longResult, onClose]);

  // --- Phase 1: Area selection ---
  if (phase === "selecting") {
    return (
      <AreaSelector
        onComplete={handleAreaSelected}
        onCancel={handleCancelSelection}
      />
    );
  }

  // --- Phase: Long screenshot capturing ---
  if (phase === "longCapturing") {
    return (
      <div className="ak-long-progress">
        <span>正在截取长截图... 第 {longProgress.currentStep} 步</span>
        <button
          onClick={handleStopLongScreenshot}
          style={{
            background: "#dc2626",
            color: "white",
            padding: "6px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          停止
        </button>
      </div>
    );
  }

  // --- Phase: Long screenshot result ---
  if (phase === "longResult" && longResult) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483647,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 20,
            maxWidth: "90vw",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600 }}>
            长截图完成 ({longResult.steps} 步, {longResult.width}×
            {longResult.height})
          </h3>
          <img
            src={longResult.dataUrl}
            alt="Long screenshot"
            style={{
              maxWidth: "100%",
              maxHeight: "60vh",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
            }}
          />
          <div
            className="ak-actions"
            style={{ marginTop: 16, justifyContent: "center" }}
          >
            <button
              onClick={handleSaveLong}
              style={{ background: "#2563eb", color: "white" }}
            >
              保存
            </button>
            <button
              onClick={handleCopyLong}
              disabled={saving}
              style={{
                background: saving ? "#d1d5db" : "#059669",
                color: "white",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "处理中..." : "复制"}
            </button>
            <button
              onClick={handleReSelect}
              style={{ background: "#6b7280", color: "white" }}
            >
              重选
            </button>
            <button
              onClick={handleClose}
              style={{ background: "#4b5563", color: "white" }}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Phase 2: Annotation ---
  if (!selectedRect) return null;

  const r = selectedRect;
  const toolbarFitsBelow = r.y + r.height + 80 < window.innerHeight;
  const toolbarTop = toolbarFitsBelow ? r.y + r.height + 8 : r.y - 88 - 8;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Full-screen mask */}
      <div
        className="ak-mask"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Punch hole: 4 mask strips around the selected area */}
      <div
        className="ak-mask"
        style={{ top: 0, left: 0, right: 0, height: r.y }}
      />
      <div
        className="ak-mask"
        style={{ top: r.y + r.height, left: 0, right: 0, bottom: 0 }}
      />
      <div
        className="ak-mask"
        style={{ top: r.y, left: 0, width: r.x, height: r.height }}
      />
      <div
        className="ak-mask"
        style={{ top: r.y, left: r.x + r.width, right: 0, height: r.height }}
      />

      {/* Annotation canvas inside the selected area */}
      <div
        style={{
          position: "absolute",
          left: r.x,
          top: r.y,
          width: r.width,
          height: r.height,
          overflow: "hidden",
          pointerEvents: "auto",
          border: "2px solid #3b82f6",
          boxShadow:
            "0 0 0 1px rgba(59,130,246,0.5), 0 0 6px rgba(59,130,246,0.4)",
        }}
      >
        <AnnotationOverlay canvasWidth={r.width} canvasHeight={r.height} />
      </div>

      {/* Toolbar + action buttons below the selection */}
      <div
        style={{
          position: "absolute",
          left: r.x,
          top: toolbarTop,
          zIndex: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <AnnotationToolbar />
        <div className="ak-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "#93c5fd" : "#2563eb",
              color: "white",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "处理中..." : "保存"}
          </button>
          <button
            onClick={handleCopy}
            disabled={saving}
            style={{
              background: saving ? "#d1d5db" : "#059669",
              color: "white",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "处理中..." : "复制"}
          </button>
          <button
            onClick={handleLongScreenshot}
            style={{ background: "#7c3aed", color: "white" }}
            title="长截图：滚动截取下方内容"
          >
            长截图
          </button>
          <button
            onClick={handleReSelect}
            style={{ background: "#6b7280", color: "white" }}
          >
            重选
          </button>
          <button
            onClick={handleClose}
            style={{ background: "#4b5563", color: "white" }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
