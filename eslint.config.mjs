// @ts-check
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';
import jestExtended from 'eslint-plugin-jest-extended';
import * as importPlugin from 'eslint-plugin-import';

const TEST_FILES = [
  '**/tests/**/*',
  '**/__tests__/**/*',
  '**/?(*.)+(spec|test).[jt]s?(x)',
  'jestSetup.[jt]s',
];

export default tseslint.config(
  {
    ignores: ['**/dist/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    // enable jest rules on test files
    files: TEST_FILES,
    ...jestPlugin.configs['flat/recommended'],
    ...jestPlugin.configs['flat/style'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      ...jestPlugin.configs['flat/style'].rules,
      'jest/consistent-test-it': [2, { fn: 'it' }],
      'jest/prefer-hooks-on-top': 2,
    },
  },
  {
    files: TEST_FILES,
    ...jestExtended.configs['flat/all'],
  },
  {
    files: ['**/*.[jt]s'],
    plugins: {
      import: { rules: importPlugin.rules },
    },
    rules: {
      'import/no-duplicates': 1,
      'import/order': [
        2,
        {
          'newlines-between': 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {
              pattern: '~/**',
              group: 'internal',
              position: 'before',
            },
          ],
          distinctGroup: false,
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        2,
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
    },
  },
  // This must be last
  eslintConfigPrettier,
);
