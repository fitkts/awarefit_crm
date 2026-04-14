import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    poolOptions: {
      threads: {
        singleThread: true,
      }
    }
  },
});
