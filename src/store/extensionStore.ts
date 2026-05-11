import { create } from 'zustand';

export interface ExtensionState {
  screenshotDataUrl: string | null;
  isOverlayActive: boolean;
  setScreenshotDataUrl: (url: string | null) => void;
  setOverlayActive: (active: boolean) => void;
  resetExtension: () => void;
}

export const useExtensionStore = create<ExtensionState>()((set) => ({
  screenshotDataUrl: null,
  isOverlayActive: false,

  setScreenshotDataUrl: (url) => set({ screenshotDataUrl: url }),
  setOverlayActive: (active) => set({ isOverlayActive: active }),
  resetExtension: () =>
    set({ screenshotDataUrl: null, isOverlayActive: false }),
}));