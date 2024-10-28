import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  input: 'src/index.ts',
  plugins: [
    typescript(),
    json(),
    nodeResolve(),
    commonjs()
  ],
  output: {
    dir: '../api',
    format: 'es',
    compact: true,
    generatedCode: 'es2015',
    sourcemap: false
  }
});