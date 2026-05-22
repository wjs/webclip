# 快捷键功能

## 架构说明

WebClip 使用 Chrome 扩展的 `commands` API 实现全局快捷键功能。核心机制：

1. 在 `manifest.json` 中声明 `_execute_action` 命令，指定默认快捷键 `Ctrl+Shift+S`（Mac 上为 `Command+Shift+S`）
2. 由于项目使用 `@crxjs/vite-plugin` 构建，该插件会剥离 manifest 中的 `commands` 和 `options_ui` 字段，因此通过 `vite.config.ts` 的 `manifestTransform` 回调在构建时注入这些字段
3. `_execute_action` 命令会自动触发 `chrome.action.onClicked` 事件（因为 manifest 没有定义 popup），与点击扩展图标共用同一个激活流程，无需额外代码
4. 选项页面（`src/options/`）通过 `chrome.commands.getAll()` 读取当前快捷键绑定并展示，引导用户前往 Chrome 的快捷键设置页面进行自定义

## 使用方法

### 启动截图

- **默认快捷键**：`Ctrl+Shift+S`（Windows/Linux）或 `Command+Shift+S`（Mac）
- **点击扩展图标**：工具栏上的 WebClip 图标

### 自定义快捷键

1. 右键点击扩展图标，选择「选项」打开设置页面
2. 查看当前快捷键绑定
3. 点击「打开快捷键设置」按钮，跳转到 `chrome://extensions/shortcuts`
4. 在 Chrome 的快捷键设置页面中修改 WebClip 的快捷键

## Chrome commands API 的限制

- **无法程序化修改快捷键**：Chrome 没有提供 `chrome.commands.update()` API，扩展无法在自己的 UI 中提供"按下新快捷键"的录制功能。用户只能通过 Chrome 的原生设置页面修改
- **快捷键格式要求**：Chrome 要求快捷键必须包含修饰键：
  - Windows/Linux：`Ctrl+Shift+字母` 或 `Alt+Shift+字母`
  - Mac：`Command+Shift+字母` 或 `Alt+Shift+字母`
- **冲突处理**：如果默认快捷键与其他扩展冲突，Chrome 不会自动绑定，用户需要手动在 `chrome://extensions/shortcuts` 中设置
- **F 键支持**：F1-F12 键可以作为快捷键，不需要修饰键组合

## 选项页面功能

- 显示当前全局快捷键绑定
- 快捷键未设置时显示醒目警告
- 一键跳转到 Chrome 快捷键设置页面
- 展示 overlay 内部快捷键列表（不可自定义）

## 首次安装提示

首次安装时，扩展图标会显示键盘 badge（⌨），提示用户配置快捷键。访问选项页面后 badge 自动清除。