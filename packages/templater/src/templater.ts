export const TEMPLATER = Symbol('Templater')

/**
 * Templater contract
 */
export interface Templater {
  render(template: string, data: object): string
}
