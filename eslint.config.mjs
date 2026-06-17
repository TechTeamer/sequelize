import mocha from 'eslint-plugin-mocha';
import jsdoc from 'eslint-plugin-jsdoc';
import unicorn from 'eslint-plugin-unicorn';
import tsParser from '@typescript-eslint/parser'

export default [
  {
    plugins: {
      mocha,
      jsdoc,
      unicorn,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: 'extends',
        },
        structuredTags: {
          typeParam: { type: false, required: ['name'] },
          category: { type: false, required: ['name'] },
          internal: { type: false },
          hidden: { type: false },
        },
      },
    },
    rules: {
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'off',
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-description-complete-sentence': 'off',
      'jsdoc/require-example': 'off',
      'jsdoc/require-hyphen-before-param-description': 'off',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-name': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/valid-types': 'error',
      'jsdoc/no-types': 'error',
      'unicorn/no-unsafe-regex': 'off',
      'unicorn/no-object-as-default-parameter': 'off',
      'unicorn/prefer-set-has': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'jsdoc/no-types': 'off',
      'jsdoc/require-param-type': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/require-returns-type': 'error',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'consistent-return': 'off',
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'unicorn/no-new-array': 'off',
      'no-restricted-globals': 'off',
      'default-case': 'off',
      'no-loop-func': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'default-param-last': 'off',
      'unicorn/error-message': 'off',
      'no-implicit-coercion': 'off',
      'no-fallthrough': 'off',
      'no-invalid-this': 'off',
      'prefer-rest-params': 'off',
      'no-loss-of-precision': 'off',
      'unicorn/prefer-object-from-entries': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-spread': 'off',
      'consistent-this': 'off',
      'unicorn/no-this-assignment': 'off',
      'unicorn/prefer-default-parameters': 'off',
      'max-statements-per-line': 'off',
      'func-names': 'off',
      'no-multi-assign': 'off',
      'max-len': 'off',
      'max-depth': 'off',
      'import/order': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-callback-reference': 'off',
    },
  },
  {
    files: ['packages/*/test/**/*.js'],
    rules: {
      'func-names': 'off',
      'import/order': 'off',
      'no-invalid-this': 'off',
      'no-unused-expressions': 'off',
      camelcase: 'off',
      'no-console': 'off',
      'no-prototype-builtins': 'off',
      'no-multi-spaces': 'off',
    },
  },
  {
    files: ['packages/*/test/**/*'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'jsdoc/check-types': 'off',
      'jsdoc/valid-types': 'off',
      'jsdoc/tag-lines': 'off',
      'jsdoc/check-tag-names': 'off',
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-skipped-tests': 'warn',
      'no-inner-declarations': 'off',
      'unicorn/no-unsafe-regex': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['packages/*/test/types/**/*'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['sscce.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'packages/*/lib/**/*',
      'packages/*/types/**/*',
      '.typedoc-build',
    ],
  },
];
