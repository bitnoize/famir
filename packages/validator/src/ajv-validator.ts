import { DIContainer } from '@famir/common'
import { Ajv, ValidateFunction } from 'ajv'
import { ValidatorError } from './validator.error.js'
import { VALIDATOR, Validator, ValidatorSchemas } from './validator.js'

/**
 * Ajv validator implementation
 *
 * @category none
 * @see [Ajv home](https://ajv.js.org/)
 */
export class AjvValidator implements Validator {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<Validator>(VALIDATOR, () => new AjvValidator())
  }

  protected readonly ajv: Ajv

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      useDefaults: true,
      coerceTypes: true,
      removeAdditional: true,
      allowUnionTypes: true,
      strictTypes: true,
      //strictTuples: true // FIXME
    })
  }

  getSchema(name: string): object | undefined {
    return this.ajv.getSchema(name)
  }

  addSchema(name: string, schema: object) {
    const existsSchema = this.getSchema(name)
    if (existsSchema) {
      throw new Error(`JSON-Schema '${name}' already exists`)
    }

    this.ajv.addSchema(schema, name)
  }

  addSchemas(schemas: ValidatorSchemas) {
    Object.entries(schemas).forEach(([name, schema]) => {
      this.addSchema(name, schema)
    })
  }

  protected getValidate<T>(name: string): ValidateFunction<T> {
    const validate = this.ajv.getSchema<T>(name)

    if (!validate) {
      throw new Error(`JSON-Schema '${name}' not known`)
    }

    return validate
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(name: string, data: unknown): data is T {
    const validate = this.getValidate<T>(name)

    return validate(data) ? true : false
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(name: string, data: unknown): asserts data is T {
    const validate = this.getValidate<T>(name)

    if (!validate(data)) {
      const validateErrors = (validate.errors || []).map((error) => {
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
          //data
        },
        validateErrors,
      })
    }
  }
}
