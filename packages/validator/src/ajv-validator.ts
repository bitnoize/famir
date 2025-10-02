import { DIContainer } from '@famir/common'
import {
  Validator,
  ValidatorAssertSchema,
  ValidatorError,
  ValidatorGuardSchema,
  ValidatorSchemas
} from '@famir/domain'
import { Ajv, ValidateFunction } from 'ajv'

export class AjvValidator implements Validator {
  static inject(container: DIContainer) {
    container.registerSingleton<Validator>('Validator', () => new AjvValidator())
  }

  private readonly _ajv: Ajv

  constructor() {
    this._ajv = new Ajv({
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
      this._ajv.addSchema(schema, name)
    })
  }

  private getSchema<T>(schemaName: string): ValidateFunction<T> {
    const validate = this._ajv.getSchema<T>(schemaName)

    if (validate == null) {
      throw new Error(`JSON-Schema '${schemaName}' not known`)
    }

    return validate
  }

  get guardSchema(): ValidatorGuardSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    return <T>(schemaName: string, data: unknown): data is T => {
      const validate = this.getSchema<T>(schemaName)

      return validate(data) ? true : false
    }
  }

  get assertSchema(): ValidatorAssertSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    return <T>(schemaName: string, data: unknown): asserts data is T => {
      const validate = this.getSchema<T>(schemaName)

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

        throw new ValidatorError(`JSON-Schema validation failed`, {
          context: {
            schemaName,
            data
          },
          validateErrors
        })
      }
    }
  }
}
