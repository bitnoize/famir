/**
 * @category none
 * @internal
 */
export const CONFIG = Symbol('Config')

/**
 * @category none
 * @internal
 */
export const CONFIG_SCHEMA = Symbol('ConfigSchema')

/**
 * Represents a config
 *
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
