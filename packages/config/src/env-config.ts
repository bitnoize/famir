import { DIContainer, LifecycleError } from '@famir/common'
import { Config, CONFIG, ConfigData, Validator, VALIDATOR } from '@famir/domain'

/**
 * Env-based config implementation.
 *
 * Provides loading configuration data from environment variables.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { AjvValidator } from '@famir/validator'
 * import { EnvConfig } from '@famir/config'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependencies in container
 * AjvValidator.register(container)
 * EnvConfig.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer, JSONSchemaType } from '@famir/common'
 * import { VALIDATOR, Validator, CONFIG, Config, ConfigData } from '@famir/domain'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve dependencies from container
 * const validator = container.resolve<Validator>(VALIDATOR)
 * const config = container.resolve<Config>(CONFIG)
 *
 * // Define your configuration interface
 * interface ServerConfig extends ConfigData {
 *   PORT: number
 *   SECRET: string
 * }
 *
 * // Define your configuration schema
 * const serverConfigSchema: JSONSchemaType<ServerConfig> = {
 *   type: 'object',
 *   required: ['PORT', 'SECRET'],
 *   properties: {
 *     PORT: { type: 'number', default: 3000 },
 *     SECRET: { type: 'string' }
 *   },
 *   additionalProperties: false,
 * } as const
 *
 * // Add schema to validator
 * validator.addSchema('server-config', serverConfigSchema)
 *
 * // Get parsed and validated configuration object
 * const configData = config.get<ServerConfig>('server-config')
 *
 * // TypeScript knows this is ServerConfig
 * console.log(configData.PORT)
 * ```
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
}
