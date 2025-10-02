import { DIContainer } from '@famir/common'
import { Config, Validator, ValidatorAssertSchema } from '@famir/domain'
import { buildConfig } from './config.utils.js'

export class EnvConfig<T> implements Config<T> {
  static inject<C>(container: DIContainer, configSchema: object) {
    container.registerSingleton<Config<C>>(
      'Config',
      (c) => new EnvConfig<C>(c.resolve<Validator>('Validator'), configSchema)
    )
  }

  protected readonly assertSchema: ValidatorAssertSchema

  constructor(validator: Validator, configSchema: object) {
    this.assertSchema = validator.assertSchema

    validator.addSchemas({
      config: configSchema
    })
  }

  private _data: T | null = null

  get data(): T {
    if (this._data !== null) {
      return this._data
    }

    this._data = buildConfig<T>(this.assertSchema)

    return this._data
  }

  reset() {
    this._data = null
  }
}
