/**
 * DI token for a validator implementation.
 */
export const VALIDATOR = Symbol('Validator')

/**
 * Defines the public contract for a validator.
 *
 * Provides type-safe methods for guarding and asserting data structures
 * against registered JSON Schemas.
 */
export interface Validator {
  /**
   * Registers a JSON Schema with a unique name.
   *
   * The schema will be compiled and cached for later validation.
   *
   * @param name - The unique identifier for the schema.
   * @param schema - The JSON Schema object.
   * @returns This validator for method chaining.
   * @throws Error If a schema with the given name is already registered.
   */
  addSchema(name: string, schema: object): this

  /**
   * Validates data against a JSON Schema, acting as a type guard.
   *
   * On success, it narrows the type of the data to the specified type `T`.
   *
   * @typeParam T - The expected type after validation.
   * @param name - The name of the schema to validate against.
   * @param data - The data to be validated.
   * @returns `true` if the data is valid, `false` otherwise.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(name: string, data: unknown): data is T

  /**
   * Validates data against a JSON Schema, acting as a type assertion.
   *
   * On failure, it throws a detailed validation error.
   *
   * @typeParam T - The expected type after validation.
   * @param name - The name of the schema to validate against.
   * @param data - The data to be validated.
   * @throws {@link ValidatorError} If validation fails, containing detailed error information.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(name: string, data: unknown): asserts data is T
}

/**
 * JSON Schema type from Ajv.
 *
 * @typeParam T - The expected type of the validated result.
 */
export { JSONSchemaType } from 'ajv'
