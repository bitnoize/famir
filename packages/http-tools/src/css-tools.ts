import * as cssTools from '@adobe/css-tools'

export type CssStylesheetAST = cssTools.CssStylesheetAST

export function parseCss(value: string): CssStylesheetAST {
  return cssTools.parse(value, {
    silent: false
  })
}

export function formatCss(ast: CssStylesheetAST): string {
  return cssTools.stringify(ast, {
    compress: true
  })
}
