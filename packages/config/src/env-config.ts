import { DIContainer } from '@famir/common'
import { Config, CONFIG, ConfigData, LifecycleError, Validator, VALIDATOR } from '@famir/domain'

/**
 * Env-based config implementation.
 *
 * Provides loading and validating configuration data from environment variables.
 */
export class EnvConfig implements Config {
  /**
   * Registers the config as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<Config>(
      CONFIG,
      (c) => new EnvConfig(c.resolve<Validator>(VALIDATOR))
    )
  }

  /**
   * Creates a new config instance.
   *
   * @param validator - The validator instance.
   */
  constructor(protected readonly validator: Validator) {}

  #cache: Record<string, ConfigData> = {}

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  get<T extends ConfigData>(schemaName: string): T {
    try {
      if (this.#cache[schemaName]) {
        return this.#cache[schemaName] as T
      }

      const conf = { ...process.env }

      this.validateConfig<T>(schemaName, conf)

      this.#cache[schemaName] = conf

      return conf
    } catch (error) {
      throw LifecycleError.wrap(error, {
        service: 'config',
      })
    }
  }

  /**
   * Validates config against a registered JSON Schema.
   *
   * @param value - The config to validate.
   * @throws LifecycleError If validation fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateConfig<T>(schemaName: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schemaName, value)
    } catch (error) {
      throw LifecycleError.create(`Validate config failed`, null, error)
    }
  }

  reset() {
    this.#cache = {}
  }
}
