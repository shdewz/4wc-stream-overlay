import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import NodeCGPlugin from 'vite-plugin-nodecg';

// Getting __dirname with ES Modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set if we're in dev mode
const isDevMode = process.env.INJECT_DEV_MODE === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173, // Temp workaround for vite-plugin-nodecg having the wrong default
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({ autoImportComponentCase: 'pascal' }),
    checker({ vueTsc: { tsconfigPath: 'tsconfig.browser.json' } }),
    NodeCGPlugin(),
  ],
  define: {
    // Make INJECT_DEV_MODE available to client code
    'import.meta.env.INJECT_DEV_MODE': JSON.stringify(isDevMode)
  },
  resolve: {
    alias: {
      '@4wc-stream-overlay': `${__dirname}/src/`,
    },
  },
});
