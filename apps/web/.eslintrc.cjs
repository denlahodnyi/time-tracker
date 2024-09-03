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
  extends: [
    'eslint:recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y', 'import'],
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
        'react/jsx-sort-props': [
          2,
          {
            reservedFirst: ['key', 'ref'],
            multiline: 'last',
            shorthandFirst: true,
            callbacksLast: true,
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
          // { blankLine: 'always', prev: '*', next: 'return' },
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
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
            warnOnUnassignedImports: true,
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
      rules: {
        '@typescript-eslint/naming-convention': [
          2,
          // Enforce that interface names do not begin with an I
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
          // Enforce that type parameters (generics) are prefixed with T
          {
            selector: 'typeParameter',
            format: ['PascalCase'],
            prefix: ['T'],
          },
        ],
        '@typescript-eslint/no-empty-object-type': [
          2,
          { allowInterfaces: 'with-single-extends' },
        ],
      },
    },

    // Node
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
    },

    // Tests
    {
      files: [
        '**/tests/**/?(*.)+(spec|test).[jt]s?(x)',
        '**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
        'setup-test-env.ts',
      ],
      plugins: ['jest', 'testing-library'],
      extends: ['plugin:testing-library/react'],
      env: {
        jest: true,
      },
      settings: {
        'import/internal-regex': '^test-utils$',
        jest: {
          version: 29,
        },
      },
    },
  ],
};
