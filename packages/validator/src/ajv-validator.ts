import { DIContainer } from '@famir/common'
import { VALIDATOR, Validator, ValidatorError, ValidatorSchemas } from '@famir/domain'
import { Ajv, ValidateFunction } from 'ajv'

export class AjvValidator implements Validator {
  static inject(container: DIContainer) {
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
      strictTuples: true
    })
  }

  addSchemas(schemas: ValidatorSchemas) {
    Object.entries(schemas).forEach(([name, schema]) => {
      this.ajv.addSchema(schema, name)
    })
  }

  protected getValidate<T>(schemaName: string): ValidateFunction<T> {
    const validate = this.ajv.getSchema<T>(schemaName)

    if (!validate) {
      throw new Error(`JSON-Schema '${schemaName}' not known`)
    }

    return validate
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  guardSchema<T>(schemaName: string, data: unknown): data is T {
    const validate = this.getValidate<T>(schemaName)

    return validate(data) ? true : false
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  assertSchema<T>(schemaName: string, data: unknown): asserts data is T {
    const validate = this.getValidate<T>(schemaName)

    if (!validate(data)) {
      const validateErrors = (validate.errors || []).map((error) => {
        return {
          keyword: error.keyword,
          instancePath: error.instancePath,
          schemaPath: error.schemaPath,
          params: error.params,
          propertyName: error.propertyName,
          message: error.message
        }
      })

      throw new ValidatorError(`JSON-Schema assertion failed`, {
        context: {
          schemaName,
          data
        },
        validateErrors
      })
    }
  }
}
