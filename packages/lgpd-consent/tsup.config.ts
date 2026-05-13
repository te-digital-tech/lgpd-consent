import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'i18n/index': 'src/i18n/index.ts',
    'integrations/gcm': 'src/integrations/gcm.ts',
    'integrations/clarity': 'src/integrations/clarity.ts',
    'integrations/meta': 'src/integrations/meta.ts',
    'integrations/gtm': 'src/integrations/gtm.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist',
});
