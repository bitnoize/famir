import { DIContainer } from '@famir/common'
import { JSONSchemaType, Validator, VALIDATOR } from '@famir/validator'
import { Config, CONFIG } from './config.js'

export class EnvConfig<T> implements Config<T> {
  static inject<C>(container: DIContainer, configSchema: JSONSchemaType<C>) {
    container.registerSingleton<Config<C>>(
      CONFIG,
      (c) => new EnvConfig<C>(c.resolve<Validator>(VALIDATOR), configSchema)
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

  reset(): this {
    this.#data = null

    return this
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
