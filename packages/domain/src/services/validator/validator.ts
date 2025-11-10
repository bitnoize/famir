export type ValidatorSchemas = Record<string, object>

export interface Validator {
  addSchemas(schemas: ValidatorSchemas): void
  guardSchema<T>(schemaName: string, data: unknown): data is T
  assertSchema<T>(schemaName: string, data: unknown): asserts data is T
}

export const VALIDATOR = Symbol('Validator')
