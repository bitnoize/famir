import { DIContainer, JSONSchemaType } from '@famir/common'
import { Config, CONFIG, Validator, VALIDATOR, ValidatorAssertSchema } from '@famir/domain'
import { buildConfig } from './config.utils.js'

export class EnvConfig<T> implements Config<T> {
  static inject<C>(container: DIContainer, configSchema: JSONSchemaType<C>) {
    container.registerSingleton<Config<C>>(
      CONFIG,
      (c) => new EnvConfig<C>(c.resolve<Validator>(VALIDATOR), configSchema)
    )
  }

  protected readonly assertSchema: ValidatorAssertSchema

  constructor(validator: Validator, configSchema: JSONSchemaType<T>) {
    this.assertSchema = validator.assertSchema

    validator.addSchemas({
      config: configSchema
    })
  }

  private _data: T | null = null

  get data(): T {
    if (this._data) {
      return this._data
    }

    this._data = buildConfig<T>(this.assertSchema)

    return this._data
  }

  reset() {
    this._data = null
  }
}
