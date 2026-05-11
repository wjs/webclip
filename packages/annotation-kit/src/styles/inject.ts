import cssRaw from './annotation-kit.css?raw';

const STYLE_ID = 'annotation-kit-styles';
let injected = false;

export function injectAnnotationKitStyles(): void {
  if (injected) return;
  if (document.getElementById(STYLE_ID)) {
    injected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = cssRaw;
  document.head.appendChild(styleEl);
  injected = true;
}

export function removeAnnotationKitStyles(): void {
  const styleTag = document.getElementById(STYLE_ID);
  if (styleTag) styleTag.remove();
  injected = false;
}