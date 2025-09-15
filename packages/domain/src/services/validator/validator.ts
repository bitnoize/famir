export type ValidatorSchemas = Record<string, object>

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export type ValidatorGuardSchema = <T>(schemaName: string, data: unknown) => data is T

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export type ValidatorAssertSchema = <T>(schemaName: string, data: unknown) => asserts data is T

export interface Validator {
  addSchemas(schemas: ValidatorSchemas): void
  readonly guardSchema: ValidatorGuardSchema
  readonly assertSchema: ValidatorAssertSchema
}
