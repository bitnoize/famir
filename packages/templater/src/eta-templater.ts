import { DIContainer } from '@famir/common'
import { TEMPLATER, Templater } from '@famir/domain'
import { Eta } from 'eta'

export class EtaTemplater implements Templater {
  static inject(container: DIContainer) {
    container.registerSingleton<Templater>(TEMPLATER, () => new EtaTemplater())
  }

  private readonly _eta: Eta

  constructor() {
    this._eta = new Eta({
      varName: 'data'
    })
  }

  render(template: string, data: object): string {
    return this._eta.renderString(template, data)
  }
}
