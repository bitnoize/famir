import { DIContainer } from '@famir/common'
import { VALIDATOR, Validator, ValidatorError } from '@famir/domain'
import { Ajv, ValidateFunction } from 'ajv'

/**
 * Ajv-based validator implementation.
 *
 * Provides fast and secure JSON Schema validation with comprehensive error reporting.
 * Uses the **Ajv** library as the underlying validation engine.
 *
 * @see https://ajv.js.org/ - Ajv documentation
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
      throw ValidatorError.create(`JSON-Schema validation failed`, validate.errors, {
        schemaName: name,
      })
    }
  }
}
