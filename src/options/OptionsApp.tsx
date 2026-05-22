import React, { useEffect, useState } from 'react';

interface CommandInfo {
  name: string;
  description: string;
  shortcut: string;
}

export const OptionsApp: React.FC = () => {
  const [commands, setCommands] = useState<CommandInfo[]>([]);

  useEffect(() => {
    chrome.commands.getAll((cmds) => {
      setCommands(
        cmds.map((c) => ({
          name: c.name ?? '',
          description: c.description ?? '',
          shortcut: c.shortcut ?? '未设置',
        })),
      );
      // Clear badge after visiting options page
      chrome.action.setBadgeText({ text: '' });
    });
  }, []);

  const openShortcutPage = () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  };

  const triggerCommand = commands.find((c) => c.name === '_execute_action');
  const isUnset = triggerCommand?.shortcut === '未设置';

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">WebClip 设置</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">快捷键设置</h2>
        <p className="text-gray-600 mb-4">
          使用快捷键可以在浏览任何网页时快速启动截图标注工具。
        </p>

        {isUnset && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 font-medium">
              快捷键尚未设置！请点击下方按钮前往 Chrome 快捷键设置页面配置。
            </p>
          </div>
        )}

        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                功能
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                快捷键
              </th>
            </tr>
          </thead>
          <tbody>
            {commands.map((cmd) => (
              <tr key={cmd.name} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-800">
                  {cmd.description || cmd.name}
                </td>
                <td className="py-3 px-4">
                  <kbd
                    className={`inline-block px-2 py-1 rounded font-mono text-sm ${
                      cmd.shortcut === '未设置'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {cmd.shortcut}
                  </kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-gray-500 text-sm mb-3">
          要修改快捷键，请前往 Chrome 扩展快捷键设置页面：
        </p>
        <button
          onClick={openShortcutPage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          打开快捷键设置
        </button>

        <p className="text-gray-400 text-xs mt-4">
          提示：Chrome 要求快捷键包含 Ctrl（Mac 上为 Command）和 Shift 的组合。
          常见冲突的快捷键可能无法设置。
        </p>
      </section>

      <section className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold mb-3">overlay 内部快捷键</h2>
        <p className="text-gray-600 mb-3">
          以下快捷键仅在截图标注 overlay 打开时生效，无法自定义：
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4 font-medium text-gray-700">
                快捷键
              </th>
              <th className="text-left py-2 px-4 font-medium text-gray-700">
                功能
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-4">
                <kbd className="inline-block px-2 py-1 rounded font-mono text-sm bg-gray-100 text-gray-800 border border-gray-200">
                  Esc
                </kbd>
              </td>
              <td className="py-2 px-4 text-gray-800">关闭 overlay / 取消选择</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-4">
                <kbd className="inline-block px-2 py-1 rounded font-mono text-sm bg-gray-100 text-gray-800 border border-gray-200">
                  Ctrl/Cmd+S
                </kbd>
              </td>
              <td className="py-2 px-4 text-gray-800">保存截图为 PNG</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-4">
                <kbd className="inline-block px-2 py-1 rounded font-mono text-sm bg-gray-100 text-gray-800 border border-gray-200">
                  Ctrl/Cmd+C
                </kbd>
              </td>
              <td className="py-2 px-4 text-gray-800">复制截图到剪贴板</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-4">
                <kbd className="inline-block px-2 py-1 rounded font-mono text-sm bg-gray-100 text-gray-800 border border-gray-200">
                  Ctrl/Cmd+Z
                </kbd>
              </td>
              <td className="py-2 px-4 text-gray-800">撤销</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-4">
                <kbd className="inline-block px-2 py-1 rounded font-mono text-sm bg-gray-100 text-gray-800 border border-gray-200">
                  v r c a t l p d
                </kbd>
              </td>
              <td className="py-2 px-4 text-gray-800">
                切换标注工具（选择/矩形/圆形/箭头/文本/标签/画笔/删除）
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};