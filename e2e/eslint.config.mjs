import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**'],
    settings: {
      playwright: {
        globalAliases: {
          test: ['testWithCreds'],
        },
      },
    },
  },
];
