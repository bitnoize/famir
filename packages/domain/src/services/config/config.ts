export const CONFIG = Symbol('Config')

export interface Config<T> {
  readonly data: T
  reset(): void
}
