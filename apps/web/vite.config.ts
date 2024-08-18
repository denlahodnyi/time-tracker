// import MillionLint from '@million/lint';
import { vitePlugin as remix } from '@remix-run/dev';
import { remixDevTools } from 'remix-development-tools';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
// import { analyzer } from 'vite-bundle-analyzer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // MillionLint.vite({
    //   filter: {
    //     include: '**/app/*.{tsx,jsx}',
    //   },
    // }),
    remixDevTools(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    // analyzer({
    //   analyzerMode: 'static',
    // }),
    visualizer({
      open: true,
      gzipSize: true,
      filename: './build/stats.html',
    }),
  ],
});
