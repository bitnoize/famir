import { DIContainer } from '@famir/common'
import { TEMPLATER, Templater } from '@famir/domain'
import { Eta } from 'eta'

export class EtaTemplater implements Templater {
  static inject(container: DIContainer) {
    container.registerSingleton<Templater>(TEMPLATER, () => new EtaTemplater())
  }

  protected readonly eta: Eta

  constructor() {
    this.eta = new Eta({
      varName: 'data'
    })
  }

  render(template: string, data: object): string {
    return this.eta.renderString(template, data)
  }
}
