export const CONFIG = Symbol('Config')
export const CONFIG_SCHEMA = Symbol('ConfigSchema')

/**
 * Config contract
 */
export interface Config<T> {
  readonly data: T
  reset(): void
}
