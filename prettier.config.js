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
      files: ['*.json'],
      options: {
        parser: 'json',
        trailingComma: 'none',
      },
    },
  ],

  plugins: ['prettier-plugin-organize-imports'],
}
