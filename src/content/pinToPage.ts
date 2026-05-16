/**
 * Pin a screenshot image to the page as a floating, draggable element.
 * Uses plain DOM (no React) so it survives overlay teardown.
 */

const STYLE_ID = "webclip-pinned-styles";

function injectPinnedStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .webclip-pinned {
      position: fixed;
      z-index: 999999;
      pointer-events: auto;
      cursor: grab;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      background: white;
    }
    .webclip-pinned.dragging { cursor: grabbing; }
    .webclip-pinned img {
      display: block;
      max-width: 90vw;
      max-height: 80vh;
      border-radius: 2px;
    }
    .webclip-pinned-close {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #1f2937;
      color: white;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      line-height: 1;
      pointer-events: auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .webclip-pinned-close:hover { background: #dc2626; }
  `;
  document.head.appendChild(style);
}

export function pinToPage(
  dataUrl: string,
  displayWidth: number,
  displayHeight: number,
  initialX: number,
  initialY: number,
): void {
  injectPinnedStyles();

  const wrapper = document.createElement("div");
  wrapper.className = "webclip-pinned";

  const img = document.createElement("img");
  img.src = dataUrl;
  img.draggable = false;
  img.style.width = `${displayWidth}px`;
  img.style.height = `${displayHeight}px`;

  const closeBtn = document.createElement("div");
  closeBtn.className = "webclip-pinned-close";
  closeBtn.textContent = "×"; // ×

  closeBtn.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.remove();
  });

  wrapper.appendChild(img);
  wrapper.appendChild(closeBtn);

  // Initial position: same as the original selection
  wrapper.style.left = `${initialX}px`;
  wrapper.style.top = `${initialY}px`;

  // Drag logic
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  wrapper.addEventListener("mousedown", (e) => {
    if (e.target === closeBtn) return;
    isDragging = true;
    wrapper.classList.add("dragging");
    startX = e.clientX;
    startY = e.clientY;
    startLeft = wrapper.offsetLeft;
    startTop = wrapper.offsetTop;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    wrapper.style.left = `${startLeft + dx}px`;
    wrapper.style.top = `${startTop + dy}px`;
  });

  const stopDrag = () => {
    isDragging = false;
    wrapper.classList.remove("dragging");
  };
  document.addEventListener("mouseup", stopDrag);

  document.body.appendChild(wrapper);
}
