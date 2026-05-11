# annotation-kit npm 包设计

## 概述

annotation-kit 是从 webclip Chrome 扩展中提取的可复用批注/绘图 npm 包。它提供 fabric.js canvas 交互、多种绘图工具、undo/redo、工具栏 UI 等功能，不依赖任何浏览器扩展 API。

## 安装与使用

### pnpm workspace 方式（推荐）

在 monorepo 的 `pnpm-workspace.yaml` 中加入 annotation-kit：

```yaml
packages:
  - 'packages/*'
```

然后在你的项目 `package.json` 中：

```json
{
  "dependencies": {
    "annotation-kit": "workspace:*"
  }
}
```

### npm 方式

```bash
npm install annotation-kit
```

## 基本用法

### 1. 注入样式

```ts
import { injectAnnotationKitStyles } from 'annotation-kit';
injectAnnotationKitStyles(); // 在 <head> 中注入 ak-* CSS
```

或通过 CSS import：

```ts
import 'annotation-kit/styles';
```

### 2. 提供截图能力

annotation-kit 的导出功能（保存 PNG、复制到剪贴板）需要截图数据源。通过 `ScreenshotProviderWrapper` 注入：

```tsx
import { ScreenshotProviderWrapper } from 'annotation-kit';

const myProvider = {
  captureScreenshot: async () => {
    // 实现你的截图逻辑，返回 PNG data URL
    // Chrome 扩展：chrome.tabs.captureVisibleTab
    // Web 应用：html2canvas
    return screenshotDataUrl;
  },
};

<ScreenshotProviderWrapper provider={myProvider}>
  <YourApp />
</ScreenshotProviderWrapper>
```

### 3. 使用组件

```tsx
import {
  AreaSelector,
  AnnotationOverlay,
  AnnotationToolbar,
  useExport,
  useAnnotationStore,
} from 'annotation-kit';

// 选区阶段
<AreaSelector onComplete={handleAreaSelected} onCancel={handleCancel} />

// 批注阶段
<AnnotationOverlay canvasWidth={width} canvasHeight={height} />

// 工具栏
<AnnotationToolbar />

// 导出
const { exportSelectedAreaPng, copyToClipboard } = useExport('my-prefix');
```

## 公开 API

### 类型

| 名称 | 说明 |
|------|------|
| `ToolType` | 工具类型枚举（Rect, Circle, Arrow, Text, Label, Pen, Select, Delete） |
| `DrawingStyle` | 绘图样式接口（color, weight, fontSize） |
| `ScreenshotProvider` | 截图提供者接口（captureScreenshot 方法） |
| `ExportConfig` | 导出配置接口 |
| `CustomProperty` | fabric 序列化自定义属性数组 |
| `Direction` | resize 方向枚举 |

### 核心

| 名称 | 说明 |
|------|------|
| `AnnotationCanvas` | fabric.Canvas 包装类（非单例），管理工具、undo/redo、事件 |
| `useAnnotationStore` | Zustand store hook（activeTool, style, selection, undo flags） |

### Undo/Redo

| 名称 | 说明 |
|------|------|
| `UndoRedoManager` | 快照式 undo/redo（canvas.toJSON/loadFromJSON），最大深度 100 |

### Context

| 名称 | 说明 |
|------|------|
| `ScreenshotProviderWrapper` | React Context Provider，注入截图能力 |
| `useScreenshotProvider` | 获取 ScreenshotProvider 的 hook |

### Hooks

| 名称 | 说明 |
|------|------|
| `useExport` | 导出 hook（exportSelectedAreaPng, copyToClipboard, exportJson） |
| `useKeyboardShortcuts` | Ctrl+Z/Y, Delete, Escape |
| `useDrawingTool` | 绘图工具状态管理 |
| `useSelection` | 选中对象状态管理 |

### 组件

| 名称 | 说明 |
|------|------|
| `AnnotationOverlay` | fabric canvas React 包装，创建/销毁 AnnotationCanvas |
| `AnnotationToolbar` | 工具栏 + undo/redo + StylePicker |
| `AreaSelector` | 拖拽选区组件 |
| `StylePicker` | 颜色/粗细/字号选择器 |
| `ExportPanel` | 导出操作面板 |

### 样式

| 名称 | 说明 |
|------|------|
| `injectAnnotationKitStyles()` | 运行时 CSS 注入（创建 `<style id="annotation-kit-styles">`） |
| `removeAnnotationKitStyles()` | 移除注入的 CSS |
| `annotation-kit/styles` | CSS 文件 import 路径 |

### 常量

| 名称 | 说明 |
|------|------|
| `COLOR_MAP` | 预设颜色数组（7 色） |
| `WEIGHT_MAP` | 预设粗细数组（2, 4, 8） |
| `FONT_SIZE_MAP` | 预设字号数组 |
| `DEFAULT_DRAWING_STYLE` | 默认绘图样式 |
| `DEFAULT_CANVAS_WIDTH/HEIGHT` | 默认 canvas 尺寸 |

## CSS 类名

annotation-kit 使用 `ak-` 前缀：

| 类名 | 用途 |
|------|------|
| `ak-mask` | 半透明遮罩 |
| `ak-select-border` | 选区边框 |
| `ak-size-label` | 选区尺寸指示 |
| `ak-hint` | 提示文字 |
| `ak-toolbar` | 工具栏容器 |
| `ak-toolbar button` | 工具按钮 |
| `ak-divider` | 工具栏分隔线 |
| `ak-color` | 颜色选择圆点 |
| `ak-weight` | 粗细选择方点 |
| `ak-weight-dot` | 粗细指示实心圆 |
| `ak-actions` | 操作按钮容器 |
| `ak-actions button` | 操作按钮（保存/复制/重选/关闭） |

## 自定义 fabric 形状

annotation-kit 注册了两个自定义 fabric 类：

- **LineArrow** — 箭头形状，`_render` 绘制箭头三角形，有 `fromObject` 用于反序列化
- **Label** — 标签形状（圆角矩形背景 + 三角指针 + 文字），文字颜色自动反转以保证对比度

使用前需确保这些形状已注册（AnnotationOverlay 内部已 import 注册）。

## 构建配置

annotation-kit 使用 Vite 构建，输出：

- `dist/annotation-kit.es.js` — ES module 格式
- `dist/annotation-kit.cjs.js` — CommonJS 格式
- `dist/annotation-kit.css` — CSS 文件
- `dist/index.d.ts` — TypeScript 类型声明

React/ReactDOM 作为 peerDependency（externalized），fabric/zustand/nanoid 打包进 bundle。