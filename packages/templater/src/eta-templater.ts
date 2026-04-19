import { DIContainer } from '@famir/common'
import { Eta } from 'eta'
import { TEMPLATER, Templater } from './templater.js'

/**
 * Eta templater implementation
 *
 * @category none
 * @see [Eta home](https://eta.js.org)
 */
export class EtaTemplater implements Templater {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<Templater>(TEMPLATER, () => new EtaTemplater())
  }

  protected readonly eta: Eta

  constructor() {
    this.eta = new Eta({
      varName: 'data',
    })
  }

  render(template: string, data: object): string {
    return this.eta.renderString(template, data)
  }
}
