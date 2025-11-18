export const TEMPLATER = Symbol('Templater')

export interface Templater {
  render(template: string, data: object): string
}
