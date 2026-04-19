export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'consistent',
  trailingComma: 'es5',
  bracketSpacing: true,
  objectWrap: 'preserve',
  bracketSameLine: false,
  arrowParens: 'always',
  proseWrap: 'preserve',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',

  overrides: [
    {
      files: ['*.md'],
      options: {
        parser: 'markdown',
        proseWrap: 'always',
      },
    },
    {
      files: ['*.json', '*.jsonc', '*.json5'],
      options: {
        parser: 'json',
        trailingComma: 'none',
      },
    },
    {
      files: ['*.css', '*.scss', '*.sass'],
      options: {
        parser: 'css',
        singleQuote: false,
      },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: {
        parser: 'yaml',
        tabWidth: 2,
      },
    },
  ],

  plugins: ['prettier-plugin-organize-imports'],
}
