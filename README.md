# WebClip

网页截图 + 圈点画批注的 Chrome 扩展。

## 功能

- 点击扩展按钮，拖拽选择截图区域
- 在选区内绘制批注：矩形、圆形、箭头、文字、标签、画笔
- 保存为 PNG 或复制到剪贴板
- 支持撤销/重做

详细功能说明见 [docs/user-guide.md](docs/user-guide.md)。

## 项目结构

本项目采用 pnpm workspace，核心批注功能抽成独立包 `annotation-kit`：

- `src/` — Chrome 扩展代码（background service worker、content script）
- `packages/annotation-kit/` — 可复用的批注 npm 包

架构设计详见 [docs/architecture.md](docs/architecture.md)，annotation-kit 包文档详见 [docs/annotation-kit.md](docs/annotation-kit.md)。

## 开发

```bash
# 安装依赖
pnpm install

# 构建 annotation-kit 包
pnpm --filter annotation-kit build

# 构建 Chrome 扩展
pnpm build
```

## 安装扩展

1. `pnpm build` 生成 `dist/` 目录
2. Chrome 打开 `chrome://extensions/`，开启开发者模式
3. 点击「加载已解压的扩展程序」，选择 `dist/` 目录
4. 工具栏出现 WebClip 图标，点击即可使用

## 技术栈

- **fabric.js v5** — canvas 绘图引擎
- **Zustand** — 状态管理
- **React 18** — UI 渲染
- **Vite + @crxjs/vite-plugin** — 构建工具
- **pnpm workspace** — 包管理