import { DIContainer, JSONSchemaType } from '@famir/common'
import { Config, CONFIG, Validator, VALIDATOR } from '@famir/domain'

export class EnvConfig<T> implements Config<T> {
  static inject<C>(container: DIContainer, configSchema: JSONSchemaType<C>) {
    container.registerSingleton<Config<C>>(
      CONFIG,
      (c) => new EnvConfig<C>(c.resolve<Validator>(VALIDATOR), configSchema)
    )
  }

  constructor(
    private readonly validator: Validator,
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
      console.error(`Build config error`, { error })

      process.exit(1)
    }
  }
}
