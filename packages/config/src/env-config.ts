import { DIContainer } from '@famir/common'
import { JSONSchemaType, Validator, VALIDATOR } from '@famir/validator'
import { Config, CONFIG, CONFIG_SCHEMA } from './config.js'

export class EnvConfig<T> implements Config<T> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  static inject<C>(container: DIContainer) {
    container.registerSingleton<Config<C>>(
      CONFIG,
      (c) =>
        new EnvConfig<C>(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<JSONSchemaType<C>>(CONFIG_SCHEMA)
        )
    )
  }

  constructor(
    protected readonly validator: Validator,
    configSchema: JSONSchemaType<T>
  ) {
    this.validator.addSchemas({
      config: configSchema
    })
  }

  #data: T | null = null

  get data(): T {
    if (this.#data) {
      return this.#data
    }

    this.#data = this.buildData()

    return this.#data
  }

  reset() {
    this.#data = null
  }

  private buildData(): T {
    try {
      const data = { ...process.env }

      this.validator.assertSchema<T>('config', data)

      return data
    } catch (error) {
      console.error(`Build config failed`, { error })

      process.exit(1)
    }
  }
}
