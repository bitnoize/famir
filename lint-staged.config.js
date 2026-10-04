export default {
  'packages/*/src/**/*.ts': [
    'eslint',
    'prettier --check'
  ],

  'README.md': [
    'prettier --check'
  ],
}
