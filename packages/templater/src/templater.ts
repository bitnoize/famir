/**
 * DI token for a templater implementation.
 */
export const TEMPLATER = Symbol('Templater')

/**
 * Data for template variable substitution.
 *
 * A key-value map where keys are variable names and values are the data
 * to be interpolated into the template.
 */
export type TemplaterData = Record<string, unknown>

/**
 * Defines the public contract for a templater.
 *
 * Provides a simple method for rendering templates with variable substitution.
 */
export interface Templater {
  /**
   * Renders a template string with the provided data.
   *
   * This method takes a template containing placeholders and a data object,
   * and returns the rendered string with all placeholders replaced.
   *
   * @param template - The template string to render.
   * @param data - Key-value pairs for variable substitution.
   * @returns The rendered string.
   * @throws TemplaterError If template rendering fails.
   */
  render(template: string, data: TemplaterData): string
}
