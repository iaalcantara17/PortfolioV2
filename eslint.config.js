import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Vercel serverless functions run on Node, not in the browser
    files: ['api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Playwright: the tests and their config run on Node, and the callbacks passed
    // to evaluate() run in the page. Not React: a fixture's `use` callback isn't
    // React's use() hook.
    files: ['e2e/**/*.js', 'playwright.config.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
