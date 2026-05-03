/**
 * Dependency injection token for validator singleton.
 *
 * @category none
 * @internal
 */
export const VALIDATOR = Symbol('Validator')

/**
 * JSON Schema validation interface.
 *
 * Provides type-safe schema validation with Ajv.
 * Supports both safe guards and assertion-based validation.
 *
 * @category none
 */
export interface Validator {
  /**
   * Retrieve a registered JSON schema by name.
   *
   * @param name - The schema identifier
   * @returns Schema object or undefined if not found
   */
  getSchema(name: string): object | undefined

  /**
   * Register a JSON schema with a unique name.
   *
   * @param name - Unique schema identifier
   * @param schema - JSON schema object
   * @throws Error if schema with name already exists
   */
  addSchema(name: string, schema: object): void

  /**
   * Register multiple schemas in bulk.
   *
   * @param schemas - Dictionary mapping schema names to schema objects
   * @throws Error if any schema name already exists
   */
  addSchemas(schemas: ValidatorSchemas): void

  /**
   * Type-safe validation using type guard.
   *
   * Returns false instead of throwing on validation failure.
   * Use this for non-critical validation.
   *
   * @typeParam T - Expected data type after validation
   * @param name - Schema name to validate against
   * @param data - Unknown data to validate
   * @returns true if data matches schema (and narrows type to T)
   *
   * @example
   * ```ts
   * interface User {
   *   id: string
   *   name: string
   * }
   *
   * if (validator.guardSchema<User>('user', inputData)) {
   *   // TypeScript knows this is User
   *   console.log(inputData.name)
   * } else {
   *   console.log('Invalid user data')
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(name: string, data: unknown): data is T

  /**
   * Strict validation using assertion.
   *
   * Throws ValidatorError with detailed validation errors on failure.
   * Use this for critical validation in request/response processing.
   *
   * @typeParam T - Expected data type after validation
   * @param name - Schema name to validate against
   * @param data - Unknown data to validate
   * @throws ValidatorError with validation error details
   *
   * @example
   * ```ts
   * interface Request {
   *   method: string
   *   path: string
   * }
   *
   * try {
   *   validator.assertSchema<Request>('request', inputData)
   *   // TypeScript knows this is Request
   *   processRequest(inputData.path)
   * } catch (error) {
   *   if (error instanceof ValidatorError) {
   *     // Detailed error info
   *     console.log(error.validateErrors)
   *   }
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(name: string, data: unknown): asserts data is T
}

/**
 * Dictionary mapping schema names to schema objects.
 *
 * @category none
 */
export type ValidatorSchemas = Record<string, object>

/**
 * JSON Schema type from Ajv library.
 *
 * Re-exported for convenience when defining typed schemas.
 *
 * @category none
 */
export { JSONSchemaType } from 'ajv'
