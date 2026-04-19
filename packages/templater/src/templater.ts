/**
 * @category none
 * @internal
 */
export const TEMPLATER = Symbol('Templater')

/**
 * Represents a templater
 *
 * @category none
 */
export interface Templater {
  /**
   * Render template
   */
  render(template: string, data: object): string
}
