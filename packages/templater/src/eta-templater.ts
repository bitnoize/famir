import { DIContainer } from '@famir/common'
import { Eta } from 'eta'
import { TemplaterError } from './templater.error.js'
import { TEMPLATER, Templater, TemplaterData } from './templater.js'

/**
 * Eta-based templater implementation.
 *
 * Uses the lightweight and fast Eta template engine as the backend.
 *
 * @see https://eta.js.org - Eta template engine documentation
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { TEMPLATER, Templater, EtaTemplater } from '@famir/templater'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * EtaTemplater.register(container)
 *
 * // Resolve dependency from container
 * const templater = container.resolve<Templater>(TEMPLATER)
 *
 * // Render simple template
 * const result = templater.render(`Hello <%= data.name %>!`, { name: 'World' })
 * console.log(result) // 'Hello World!'
 * ```
 */
export class EtaTemplater implements Templater {
  /**
   * Registers the templater as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<Templater>(TEMPLATER, () => new EtaTemplater())
  }

  /** Underlying Eta instance. */
  protected readonly eta: Eta

  /**
   * Creates a new templater instance.
   */
  constructor() {
    this.eta = new Eta({
      varName: 'data',
    })
  }

  render(template: string, data: TemplaterData): string {
    try {
      return this.eta.renderString(template, data)
    } catch (error) {
      throw new TemplaterError(`Rendering template failed`, {
        cause: error,
        context: {
          template: template.substring(0, 100),
          data,
        },
      })
    }
  }
}
