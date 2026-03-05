export { JSONSchemaType } from 'ajv'

export const VALIDATOR = Symbol('Validator')

export interface Validator {
  getSchema(name: string): object | undefined
  addSchema(name: string, schema: object): void
  addSchemas(schemas: ValidatorSchemas): void
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(name: string, data: unknown): data is T
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(name: string, data: unknown): asserts data is T
}

export type ValidatorSchemas = Record<string, object>
