export interface Config<C> {
  readonly data: C
  reset(): void
}

export const CONFIG = Symbol('Config')

