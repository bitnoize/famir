export { JSONSchemaType } from 'ajv'

export type ValidatorSchemas = Record<string, object>

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export type ValidatorAssertSchema = <T>(
  schemaName: string,
  data: unknown,
  entry: string
) => asserts data is T

export interface Validator {
  addSchemas(schemas: ValidatorSchemas): void
  readonly assertSchema: ValidatorAssertSchema
}
