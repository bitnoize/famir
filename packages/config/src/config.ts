/**
 * DI token for a config implementation.
 */
export const CONFIG = Symbol('Config')

/**
 * Base type for configuration data.
 */
export type ConfigData = Record<string, string | number | boolean>

/**
 * Defines the public contract for a config.
 *
 * Implementations are responsible for loading, parsing, and validating
 * configuration data from a specific source.
 */
export interface Config {
  /**
   * Retrieves and validates a configuration object.
   *
   * The configuration data is loaded from the implementation's source
   * and validated against a pre-registered JSON Schema.
   * The result is cached to avoid redundant processing.
   *
   * @typeParam T - The expected type of the configuration object.
   * @param schemaName - The name of the schema registered in the validator.
   * @returns The validated and typed configuration object.
   * @throws {@link BootstrapError} If loading or validation of the configuration fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  get<T extends ConfigData>(schemaName: string): T
}
