import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const envBaseUrl =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.BASE_URL || '/';

export default defineConfig({
  base: envBaseUrl,
  plugins: [react()],
});
