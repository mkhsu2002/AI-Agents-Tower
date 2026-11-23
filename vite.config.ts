import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{studio:resolve('index.html'),guide:resolve('agents/start.html')}}}});
