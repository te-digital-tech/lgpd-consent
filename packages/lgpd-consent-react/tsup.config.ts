import { readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

const DIRECTIVE = "'use client';";
const BUNDLES = ['dist/index.js', 'dist/index.cjs'];

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist',
  external: ['react', 'react-dom', '@te-digital/lgpd-consent'],
  // Every export of this package is a client component or a hook — the whole
  // bundle is client-only. esbuild strips per-file `'use client'` directives
  // when bundling into a single chunk (and a `banner` is stripped the same
  // way), so re-prepend the directive to the built bundles. Without it,
  // importing any export from a React Server Component pulls the package into
  // the RSC graph and `React.createContext` throws.
  async onSuccess() {
    for (const file of BUNDLES) {
      const code = await readFile(file, 'utf8');
      if (!code.startsWith(DIRECTIVE)) {
        await writeFile(file, `${DIRECTIVE}\n${code}`);
      }
    }
  },
});
