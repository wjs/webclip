import React from 'react';
import ReactDOM from 'react-dom/client';
import { injectAnnotationKitStyles, ScreenshotProviderWrapper } from 'annotation-kit';
import type { ScreenshotProvider } from 'annotation-kit';
import { OverlayContainer } from './OverlayContainer';

// Chrome extension's screenshot provider — wraps chrome.runtime.sendMessage
const chromeScreenshotProvider: ScreenshotProvider = {
  captureScreenshot: (): Promise<string | null> =>
    new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'REQUEST_SCREENSHOT' },
        (response) => {
          if (response?.error) {
            console.error('Screenshot capture failed:', response.error);
            resolve(null);
          } else {
            resolve(response?.dataUrl ?? null);
          }
        },
      );
    }),
};

// Inject overlay host CSS (this is webclip-specific, not part of annotation-kit)
function injectHostStyles() {
  if (document.getElementById('webclip-host-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'webclip-host-styles';
  styleEl.textContent = `
    #webclip-overlay-host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      pointer-events: auto;
    }
  `;
  document.head.appendChild(styleEl);
}

let root: ReactDOM.Root | null = null;
let hostElement: HTMLDivElement | null = null;

function mountOverlay() {
  if (hostElement && hostElement.parentNode) return;

  // Inject annotation-kit CSS + overlay host CSS
  injectAnnotationKitStyles();
  injectHostStyles();

  hostElement = document.createElement('div');
  hostElement.id = 'webclip-overlay-host';
  document.body.appendChild(hostElement);

  root = ReactDOM.createRoot(hostElement);
  root.render(
    <React.StrictMode>
      <ScreenshotProviderWrapper provider={chromeScreenshotProvider}>
        <OverlayContainer onClose={unmountOverlay} />
      </ScreenshotProviderWrapper>
    </React.StrictMode>,
  );
}

function unmountOverlay() {
  document.body.style.overflow = '';

  if (root) {
    root.unmount();
    root = null;
  }

  if (hostElement && hostElement.parentNode) {
    hostElement.remove();
    hostElement = null;
  }

  chrome.runtime.sendMessage({ type: 'OVERLAY_CLOSED' });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SHOW_OVERLAY') {
    mountOverlay();
    sendResponse({ ok: true });
  }
  return false;
});

// Mount immediately on first injection
mountOverlay();

// Prevent page scroll jump when fabric's hidden textarea gets focused
let savedScrollY = 0;
const preventScrollJump = () => { savedScrollY = window.scrollY; };
const restoreScroll = () => { if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY); };
document.addEventListener('focusin', preventScrollJump, true);
document.addEventListener('focusout', restoreScroll, true);