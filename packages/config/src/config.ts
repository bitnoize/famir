/**
 * @category none
 * @internal
 */
export const CONFIG = Symbol('Config')

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
