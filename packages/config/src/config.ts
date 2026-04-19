/**
 * DI token
 * @category DI
 */
export const CONFIG = Symbol('Config')

/**
 * DI token
 * @category DI
 */
export const CONFIG_SCHEMA = Symbol('ConfigSchema')

/**
 * Represents a config
 * @category none
 */
export interface Config<T> {
  /**
   * Config object
   */
  readonly data: T

  /**
   * Cleanup config
   */
  reset(): void
}
