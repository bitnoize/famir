export interface Templater {
  render(template: string, data: object): string
}

export const TEMPLATER = Symbol('Templater')
