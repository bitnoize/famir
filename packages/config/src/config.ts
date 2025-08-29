export interface Config<C> {
  readonly data: C
  reset(): void
}
