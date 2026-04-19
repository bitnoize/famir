/**
 * DI token
 * @category DI
 */
export const VALIDATOR = Symbol('Validator')

/**
 * Represents a validator
 * @category none
 */
export interface Validator {
  /**
   * Get schema by name
   */
  getSchema(name: string): object | undefined

  /**
   * Add schema object
   */
  addSchema(name: string, schema: object): void

  /**
   * Bulk adding schemas
   */
  addSchemas(schemas: ValidatorSchemas): void

  /**
   * Safe validate data
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(name: string, data: unknown): data is T

  /**
   * Validate data with exception on fail
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(name: string, data: unknown): asserts data is T
}

/**
 * Dictionary with schemas
 * @category none
 */
export type ValidatorSchemas = Record<string, object>

/**
 * Ajv JSON-Schema Type
 * @category none
 */
export { JSONSchemaType } from 'ajv'
