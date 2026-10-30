import { DIContainer } from '@famir/common'
import { TEMPLATER, Templater, TemplaterData, TemplaterError } from '@famir/domain'
import { Eta } from 'eta'

/**
 * Eta-based templater implementation.
 *
 * Uses the lightweight and fast Eta template engine as the backend.
 *
 * @see https://eta.js.org - Eta template engine documentation
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
      throw TemplaterError.create(`Render template failed`, null, error)
    }
  }
}
