import tsEslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'logs/',
      '*.config.js',
      '*.test.ts',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsEslint.parser,
      globals: {
        ...globals.node,
      },
    },
  },
  ...tsEslint.configs.recommended,
  prettier
);
