import { DIContainer } from '@famir/common'
import { Eta } from 'eta'
import { TEMPLATER, Templater } from './templater.js'

/*
 * Eta templater implementation
 */
export class EtaTemplater implements Templater {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<Templater>(TEMPLATER, () => new EtaTemplater())
  }

  protected readonly eta: Eta

  constructor() {
    this.eta = new Eta({
      varName: 'data'
    })
  }

  /*
   * Render template
   */
  render(template: string, data: object): string {
    return this.eta.renderString(template, data)
  }
}
