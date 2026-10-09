import {defineConfig} from 'vite';
import stylexPlugin from '@stylexjs/unplugin';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const extension = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {default: manifest} = await import(resolve(process.cwd(), 'vendor/skom/stylex-connector/Resources/Private/Build/stylex-manifest.mjs'));
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [
    stylexPlugin.vite({useCSSLayers: true, unstable_moduleResolution: {type:'commonJS', rootDir:process.cwd()}}),
    manifest({outputPath:resolve(extension,'Resources/Public/StylexManifest/stylex-manifest.json'), root:extension, namespace:'typo3_astryx', compilerVersion:'0.19.1', include:id => id.startsWith(extension + '/') && id.endsWith('.stylex.js')}),
  ],
  build: {
    outDir: resolve(extension, 'Resources/Public/Assets'), emptyOutDir: true, manifest: true,
    rollupOptions: {
      input: {astryx:resolve(extension,'Resources/Private/JavaScript/Main.entry.js'), rte:resolve(extension,'Resources/Private/JavaScript/Rte.entry.js'), preview:resolve(extension,'Resources/Private/JavaScript/Preview.entry.js')},
      output: {entryFileNames:'[name].js', chunkFileNames:'[name]-[hash].js', assetFileNames:'[name][extname]'},
    },
  },
});
