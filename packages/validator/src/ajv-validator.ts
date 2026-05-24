import { DIContainer } from '@famir/common'
import { Ajv, ValidateFunction } from 'ajv'
import { ValidatorError } from './validator.error.js'
import { VALIDATOR, Validator } from './validator.js'

/**
 * Ajv-based validator implementation.
 *
 * Provides thread-safe JSON Schema validation with comprehensive error reporting.
 * Uses the Ajv library as the underlying validation engine.
 *
 * @see https://ajv.js.org/ - Ajv documentation
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import {
 *   VALIDATOR,
 *   Validator,
 *   AjvValidator,
 *   ValidatorError,
 *   JSONSchemaType,
 * } from '@famir/validator'
 *
 * // Get the container singleton.
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * AjvValidator.register(container)
 *
 * // Resolve dependency from container
 * const validator = container.resolve<Validator>(VALIDATOR)
 *
 * // Define your user interface
 * interface User {
 *   name: string
 *   age: number
 * }
 *
 * // Define your user schema
 * const userSchema: JSONSchemaType<User> = {
 *   type: 'object',
 *   required: ['name', 'age'],
 *   properties: {
 *     name: { type: 'string' },
 *     age: { type: 'number', minimum: 0 }
 *   },
 *   additionalProperties: false,
 * } as const
 *
 * // Add schema to validator
 * validator.addSchema('user', userSchema)
 *
 * // Any data to validate
 * const data: unknown = { name: 'John', age: 30 }
 *
 * // Type-safe guard validation
 * if (validator.guardSchema<User>('user', data)) {
 *   // TypeScript knows this is User
 *   console.log(data.name)
 * } else {
 *   console.warn('Invalid user data')
 * }
 *
 * // Type-safe assert validation with exception filter
 * try {
 *   validator.assertSchema<User>('user', data)
 *   // TypeScript knows this is User
 *   console.log(data.age)
 * } catch (error) {
 *   if (error instanceof ValidatorError) {
 *     console.warn(error.validateErrors)
 *   } else {
 *     console.error(error)
 *   }
 * }
 * ```
 */
export class AjvValidator implements Validator {
  /**
   * Registers the validator as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<Validator>(VALIDATOR, () => new AjvValidator())
  }

  /** Underlying Ajv instance. */
  protected readonly ajv: Ajv

  /**
   * Creates a new validator instance.
   */
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      useDefaults: true,
      coerceTypes: true,
      removeAdditional: true,
      allowUnionTypes: true,
      strictTypes: true,
      strictTuples: true,
    })
  }

  addSchema(name: string, schema: object): this {
    const existsSchema = this.ajv.getSchema(name)

    if (existsSchema) {
      throw new Error(`JSON-Schema already exists: ${name}`)
    }

    this.ajv.addSchema(schema, name)

    return this
  }

  /**
   * Retrieves a compiled validation function for a given schema.
   *
   * @param name - The unique identifier for the schema.
   * @returns The compiled validation function.
   * @throws Error If a schema with the given name is not found.
   */
  protected getValidate<T>(name: string): ValidateFunction<T> {
    const validate = this.ajv.getSchema<T>(name)

    if (!validate) {
      throw new Error(`JSON-Schema not known: ${name}`)
    }

    return validate
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(name: string, data: unknown): data is T {
    const validate = this.getValidate<T>(name)

    return validate(data)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(name: string, data: unknown): asserts data is T {
    const validate = this.getValidate<T>(name)

    if (!validate(data)) {
      const validateErrors = (validate.errors ?? []).map((error) => {
        return {
          keyword: error.keyword,
          instancePath: error.instancePath,
          schemaPath: error.schemaPath,
          params: error.params,
          propertyName: error.propertyName,
          message: error.message,
        }
      })

      throw new ValidatorError(`JSON-Schema assertion failed`, {
        context: {
          schemaName: name,
        },
        validateErrors,
      })
    }
  }
}
