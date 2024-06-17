/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: ['!**/.server', '!**/.client'],

  // Base config
  extends: ['eslint:recommended'],

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
      ],
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
        'import/resolver': {
          typescript: {},
        },
      },
      rules: {
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

    // Typescript
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'import'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/internal-regex': '^~/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
            project: '**/tsconfig.json',
          },
        },
      },
      extends: [
        'plugin:@typescript-eslint/strict',
        'plugin:@typescript-eslint/stylistic',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
      ],
      rules: {},
    },

    // Node
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
    },
  ],
};
