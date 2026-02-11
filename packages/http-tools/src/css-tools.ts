import { CssStylesheetAST, parse, stringify } from '@adobe/css-tools'

export function parseCss(content: string): CssStylesheetAST {
  return parse(content, {
    silent: false
  })
}

export function formatCss(ast: CssStylesheetAST): string {
  return stringify(ast, {
    compress: true
  })
}
