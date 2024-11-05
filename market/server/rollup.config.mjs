import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import path from 'path';

export default defineConfig({
  input: 'src/index.ts',
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: path.resolve(import.meta.dirname, 'src') }
      ]
    }),
    typescript(),
    nodeResolve(),
    json({
      compact: true,
      preferConst: true
    }),
    commonjs(),
  ],
  output: {
    dir: '../api',
    format: 'cjs',
    compact: true,
    generatedCode: 'es2015',
    sourcemap: false
  }
});