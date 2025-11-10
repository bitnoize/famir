export interface Config<T> {
  readonly data: T
  reset(): void
}

export const CONFIG = Symbol('Config')
