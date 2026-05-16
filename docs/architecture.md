# WebClip 项目架构设计

## 项目概述

WebClip 是一个 Chrome 扩展，用于网页截图 + 圈点画批注。用户点击扩展按钮后，拖拽选择截图区域，然后在选区内绘制批注（矩形、圆形、箭头、文字、标签、画笔），最终将选区截图 + 批注合成图片保存或复制到剪贴板。

项目采用 **pnpm workspace** 结构，核心批注功能抽成独立 npm 包 `annotation-kit`，webclip 扩展作为消费者引用该包。

## 技术栈

| 类别 | 选择 | 说明 |
|------|------|------|
| Canvas 库 | fabric.js v5 | 丰富的交互模型，IText 支持行内编辑，自定义形状 via createClass |
| 状态管理 | Zustand | ~1KB，支持 persist middleware，工作在 React 外部 |
| 构建工具 | Vite + @crxjs/vite-plugin | 快速 HMR，原生 TS/React 支持 |
| 包管理 | pnpm workspace | annotation-kit 作为本地包，无需发 npm |
| 扩展规范 | Manifest V3 | activeTab + scripting 权限，动态注入 content script |

## 项目结构

```
webclip/
  pnpm-workspace.yaml           — workspace 配置
  package.json                   — webclip 扩展（消费者）
  manifest.json                  — Chrome 扩展 manifest V3
  vite.config.ts                 — 扩展构建配置

  src/                           — webclip 扩展专属代码
    background/index.ts          — service worker：注入 content script，截图捕获
    content/index.tsx            — content script 入口：挂载 React overlay，监听 Chrome 消息
    content/OverlayContainer.tsx — 四阶段 overlay（选区 → 批注 → 长截图截取 → 长截图结果），使用 annotation-kit 组件
    store/extensionStore.ts      — 扩展状态（screenshotDataUrl），属于 webclip 不属于 annotation-kit
    styles.css                   — Tailwind 入口

  packages/
    annotation-kit/              — 可复用的批注 npm 包
      package.json
      tsconfig.json
      vite.config.ts
      src/
        index.ts                 — barrel export（公开 API）
        types.ts                 — ToolType, DrawingStyle, ScreenshotProvider, LongScreenshotOptions 等
        constants.ts             — COLOR_MAP, WEIGHT_MAP, FONT_SIZE_MAP 等
        fabric-ext.d.ts          — fabric.js 自定义类型声明
        AnnotationCanvas.ts      — fabric.Canvas 包装类（非单例）
        store/annotationStore.ts — Zustand store（activeTool, style, undo flags）
        undo/UndoRedoManager.ts  — 快照式 undo/redo（canvas.toJSON/loadFromJSON）
        undo/types.ts
        tools/                   — 7 个 IObjectDrawer 实现
          IObjectDrawer.ts       — drawer 接口
          RectDrawer.ts          — 矩形
          CircleDrawer.ts        — 椭圆
          ArrowDrawer.ts         — 箭头（fabric.LineArrow）
          TextDrawer.ts          — 文字（fabric.IText）
          LabelDrawer.ts         — 标签（fabric.Label）
          PenDrawer.ts           — 画笔（freeDrawingMode）
        shapes/                  — 自定义 fabric 形状
          LineArrow.ts           — 箭头类（有 _render 和 fromObject）
          Label.ts               — 标签类（圆角矩形 + 三角指针）
        hooks/
          useExport.ts           — 导出 hook（通过 ScreenshotProvider Context 获取截图）
          useLongScreenshot.ts   — 长截图 hook（滚动 + 截取 + 拼接）
          useKeyboardShortcuts.ts — Ctrl+Z/Y, Delete, Escape
          useDrawingTool.ts
          useSelection.ts
        context/
          ScreenshotContext.tsx   — React Context，注入截图能力
        utils/
          stitchImages.ts        — 截图裁剪 + 垂直拼接
        components/
          AnnotationOverlay.tsx  — React 组件，创建 AnnotationCanvas 实例
          AnnotationToolbar.tsx  — 工具栏 + StylePicker
          AreaSelector.tsx       — 拖拽选区组件
          StylePicker.tsx        — 颜色/粗细/字号选择器
          ToolButton.tsx
          TextEditorOverlay.tsx
          ExportPanel.tsx
        styles/
          annotation-kit.css     — ak-* CSS 规则
          inject.ts              — 运行时 CSS 注入辅助函数
```

## Chrome 扩展架构

### Manifest V3 权限

- `activeTab` — 用户点击时授予临时访问，安装时无警告
- `scripting` — 动态注入 content script 所需

### 激活流程

1. 用户点击扩展按钮
2. Background service worker 收到 `chrome.action.onClicked`
3. 先尝试 `chrome.tabs.sendMessage(SHOW_OVERLAY)` — 如果 content script 已加载，直接显示 overlay
4. 如果失败（content script 未加载），回退到 `chrome.scripting.executeScript` 注入
5. Content script 注入 CSS + 挂载 React overlay
6. 用户在 overlay 内完成选区 + 批注

### 截图导出流程

1. 用户点击"保存"或"复制"
2. `useExport` hook 通过 `ScreenshotProvider` Context 调用 `captureScreenshot()`
3. webclip 实现的 ScreenshotProvider 调用 `chrome.runtime.sendMessage(REQUEST_SCREENSHOT)`
4. Background 调用 `chrome.tabs.captureVisibleTab()` 返回 PNG data URL
5. Content script 裁剪选区区域 + 合成批注层 → 下载 PNG / 复制到剪贴板

### 长截图导出流程

1. 用户点击「长截图」按钮
2. OverlayContainer 切换到 `'longCapturing'` phase，释放页面滚动锁
3. `useLongScreenshot` hook 调用 `captureScreenshotAtScroll(initialScrollY)` 截取当前视口
4. 循环：页面向下滚动 `selectedRect.height` → 等待渲染 → 截取视口 → 裁剪到选区范围
5. 每步裁剪后的片段存入 `segments[]` 数组
6. 用户点击「停止」或页面到达底部 → 停止循环
7. `stitchVertically(segments, annotationCanvas)` 垂直拼接所有片段 + 批注叠加在首段
8. 切换到 `'longResult'` phase → 显示预览 → 保存/复制

### 关闭与重触发

- 关闭 overlay 时：React root unmount + host element remove，但 **content script 的消息监听器保留**
- 再次点击扩展按钮 → background 发 `SHOW_OVERLAY` 消息 → content script 收到后重新挂载 overlay
- 无需重新注入 content script

## annotation-kit 包设计

### ScreenshotProvider 解耦

annotation-kit 不直接依赖 Chrome API。截图能力通过 React Context 注入：

```tsx
<ScreenshotProviderWrapper provider={myScreenshotProvider}>
  <OverlayContainer onClose={handleClose} />
</ScreenshotProviderWrapper>
```

任何宿主项目只需实现 `ScreenshotProvider` 接口：
```ts
interface ScreenshotProvider {
  captureScreenshot(): Promise<string | null>;
  captureScreenshotAtScroll?(scrollY: number): Promise<string | null>;
}
```

- Chrome 扩展：用 `chrome.tabs.captureVisibleTab`
- Web 应用：用 `html2canvas` 或服务端 API
- Electron：用 Electron IPC

### CSS 策略

- 类前缀 `ak-*`（annotation-kit），避免与宿主项目冲突
- 导出 `injectAnnotationKitStyles()` 函数，在 DOM head 中注入 `<style>` 标签（适合 content script）
- 也导出 `annotation-kit/styles` CSS 文件路径（适合普通 web app import）

### React 作为 peerDependency

宿主项目提供 React，防止 hooks 因重复实例崩溃。

### 公开 API

annotation-kit 通过 `index.ts` 导出：

- **类型**：ToolType, DrawingStyle, ScreenshotProvider, ExportConfig 等
- **核心**：AnnotationCanvas, useAnnotationStore
- **Undo/Redo**：UndoRedoManager
- **Hooks**：useExport, useKeyboardShortcuts, useSelection, useDrawingTool
- **组件**：AnnotationOverlay, AnnotationToolbar, AreaSelector, StylePicker 等
- **Context**：ScreenshotProviderWrapper, useScreenshotProvider
- **样式**：injectAnnotationKitStyles, removeAnnotationKitStyles

### 两阶段 Overlay 流程

**Phase 1 — 选区**：AreaSelector 组件，用户拖拽选择截图区域。半透明遮罩覆盖非选区，选区有蓝色边框 + glow 效果。

**Phase 2 — 批注**：AnnotationOverlay 在选区内渲染 fabric canvas。4 个遮罩条带（上/下/左/右）形成 punch-hole 效果。工具栏在选区下方（空间不足时在上方）。

**Phase 3 — 长截图截取**：用户点击「长截图」按钮，overlay 隐藏，页面滚动锁释放。页面按选区高度向下滚动，每步截取 viewport → 裁剪到选区范围 → 存入内存。底部显示进度（步数）和「停止」按钮。用户点击停止或页面到底时进入 Phase 4。

**Phase 4 — 长截图结果**：所有裁剪片段垂直拼接为一张长图，批注叠加在第一个片段上。显示预览窗口，可保存 PNG 或复制到剪贴板。

### 钉住截图

用户点击「钉住」按钮后：
1. `useExport` 生成合并 PNG data URL（截图 + 批注）
2. `pinToPage()` 创建纯 DOM 元素（非 React）挂载到 `document.body`
3. Overlay 关闭（React root 销毁），钉住的图片独立存活
4. 钉住元素为 `position: fixed` 的 wrapper div，尺寸等于图片尺寸，z-index 为 999999
5. 拖拽通过 mousedown/mousemove/mouseup 实现（close button 的 mousedown 不触发拖拽）
6. 右上方有 close 按钮（X），点击移除钉住元素
7. wrapper div 仅为图片大小，外部区域不受影响，click 自然穿透到页面

## 关键设计决策

| 问题 | 决策 | 原因 |
|------|------|------|
| fabric vs react-konva | fabric.js | 原版 DrawingEditor 用 fabric，API 熟悉，IText 支持行内编辑 |
| Shadow DOM vs head CSS | 页面 `<head>` CSS 注入 | Shadow DOM 会阻断外部 CSS，导致组件样式失效 |
| Singleton vs per-instance | 非单例 AnnotationCanvas | 避免全局缓存、内存泄漏、多实例冲突 |
| 自定义 resize controls vs fabric Controls | fabric Controls | 原版手动创建 Circle/Line resize handle，数百行坐标数学，fabric v5 提供正式 Control API |
| 快照式 vs 操作式 undo/redo | 快照式 | canvas.toJSON/loadFromJSON，避免 Arrow/Label 反序列化 bug |
| 扩展 UI | content script overlay | 直接在页面上标注，最自然的批注 UX |
| ScreenshotProvider Context | React Context | 解耦 Chrome API，多组件共享，避免 prop 传递 |
| 长截图实现 | 滚动+逐帧截取+拼接 | captureVisibleTab 只截取可见区域，需滚动多次拼接 |
| 长截图截取位置 | ScreenshotProvider.captureScreenshotAtScroll | 解耦滚动逻辑，宿主项目控制滚动+截取时机 |
| 长截图拼接 | 垂直直接拼接（无重叠裁剪） | 初版简单方案，避免复杂重叠检测算法 |
| 钉住截图 | 纯 DOM 元素（非 React root） | overlay 关闭时 React root 被销毁，钉住的图片需要脱离 React 生命周期独立存活；使用 position:fixed + mousedown/mousemove/mouseup 实现拖拽；wrapper div 仅为图片尺寸，外部区域自然 click-through |