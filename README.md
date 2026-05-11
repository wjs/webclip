# WebClip

网页截图 + 圈点画批注的 Chrome 扩展。

## 功能

- 点击扩展按钮，拖拽选择截图区域
- 在选区内绘制批注：矩形、圆形、箭头、文字、标签、画笔
- 长截图：滚动截取选区下方内容，拼接为一张长图
- 保存为 PNG 或复制到剪贴板
### 绘图工具

| 工具 | 图标 | 说明 |
|------|------|------|
| 选择 | ☝ | 选中、移动、缩放已有批注 |
| 矩形 | ▭ | 绘制矩形框 |
| 圆形 | ◯ | 绘制椭圆 |
| 箭头 | → | 绘制带箭头的线 |
| 文字 | T | 输入文字批注（点击后直接输入） |
| 标签 | 💬 | 绘制带背景色的标签批注 |
| 画笔 | ✎ | 自由手绘 |
| 删除 | ✕ | 删除选中批注 |

### 操作按钮

| 按钮 | 说明 |
|------|------|
| 保存 | 将选区截图 + 批注合成 PNG 下载 |
| 复制 | 将选区截图 + 批注合成 PNG 复制到剪贴板 |
| 长截图 | 滚动截取选区下方内容，拼接为长图 |
| 重选 | 回到选区阶段 |
| 关闭 | 关闭截图界面 |

### 长截图

1. 框选截图区域后，点击「长截图」按钮
2. 页面自动向下滚动，每次滚动高度等于选区高度
3. 底部显示进度和「停止」按钮
4. 点击停止或页面到底时，所有片段拼接为一张长图
5. 长图完成后可保存或复制到剪贴板

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

### 方式一：从 Release 下载（推荐）

1. 到 [Releases](https://github.com/anthropics/webclip/releases) 页面下载最新版本的 `webclip-v*.zip`
2. 解压 zip 文件
3. Chrome 打开 `chrome://extensions/`，开启开发者模式
4. 点击「加载已解压的扩展程序」，选择解压后的目录
5. 工具栏出现 WebClip 图标，点击即可使用

### 方式二：自行构建

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