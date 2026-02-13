export { JSONSchemaType } from 'ajv'

export const VALIDATOR = Symbol('Validator')

export interface Validator {
  addSchemas(schemas: ValidatorSchemas): void
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(schemaName: string, data: unknown): data is T
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(schemaName: string, data: unknown): asserts data is T
}

export type ValidatorSchemas = Record<string, object>
