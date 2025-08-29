import { Validator, ValidatorAssertSchema } from '@famir/validator'
import { Config } from './config.js'
import { buildConfig } from './config.utils.js'

export class EnvConfig<C> implements Config<C> {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(validator: Validator, configSchema: object) {
    this.assertSchema = validator.assertSchema

    validator.addSchemas({
      config: configSchema
    })
  }

  private _data: C | null = null

  get data(): C {
    if (this._data !== null) {
      return this._data
    }

    this._data = buildConfig<C>(this.assertSchema)

    return this._data
  }

  reset() {
    this._data = null
  }
}
