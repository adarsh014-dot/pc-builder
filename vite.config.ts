import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /<repo>/, so the base has to match
// when building for Pages, and stay '/' for local dev and preview.
const base = process.env.GH_PAGES === 'true' ? '/pc-builder/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
