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
  'jestSetup*.[jt]s',
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
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
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
      'padding-line-between-statements': [
        2,
        // blank before return
        { blankLine: 'always', prev: 'expression', next: '*' },
        // ...but not between
        { blankLine: 'any', prev: 'expression', next: 'expression' },
        // ...allow before break
        { blankLine: 'any', prev: 'expression', next: 'break' },
        // blank before return
        { blankLine: 'always', prev: '*', next: 'return' },
        // blank after if
        { blankLine: 'always', prev: 'if', next: '*' },
        // ...but not between
        { blankLine: 'never', prev: 'if', next: 'if' },
        // blank after single var
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        // ...but not between
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        // blank before single export
        {
          blankLine: 'always',
          prev: '*',
          next: 'export',
        },
        // ...but not between
        {
          blankLine: 'any',
          prev: 'export',
          next: 'export',
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': [
        2,
        {
          ignoreRestArgs: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        2,
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/padding-line-between-statements': [
        2,
        // blank after single type
        {
          blankLine: 'always',
          prev: ['interface', 'type'],
          next: '*',
        },
        // ...but not between
        {
          blankLine: 'any',
          prev: ['interface', 'type'],
          next: ['interface', 'type'],
        },
      ],
    },
  },
  // This must be last
  eslintConfigPrettier,
);
