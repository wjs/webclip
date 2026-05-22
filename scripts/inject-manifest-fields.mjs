import { readFileSync, writeFileSync } from 'fs';

const manifestPath = 'dist/manifest.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

manifest.options_ui = {
  page: 'src/options/options.html',
  open_in_tab: true,
};

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');