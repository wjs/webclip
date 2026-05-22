import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest,
      manifestTransform(manifest) {
        manifest.commands = {
          _execute_action: {
            suggested_key: {
              default: 'Ctrl+Shift+S',
              mac: 'Command+Shift+S',
            },
            description: '启动截图标注',
          },
        };
        if (!manifest.permissions.includes('storage')) {
          manifest.permissions.push('storage');
        }
        return manifest;
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.tsx'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});