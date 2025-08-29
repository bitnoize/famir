import { MalformDataError } from '@famir/common'
import { Ajv } from 'ajv'
import { Validator, ValidatorAssertSchema, ValidatorSchemas } from './validator.js'

export class AjvValidator implements Validator {
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

  get assertSchema(): ValidatorAssertSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    return <T>(schemaName: string, data: unknown, entry: string): asserts data is T => {
      const validate = this._ajv.getSchema<T>(schemaName)

      if (validate === undefined) {
        throw new Error(`JSON-Schema '${schemaName}' not known`)
      }

      if (!validate(data)) {
        throw new MalformDataError(entry, data, validate.errors)
      }
    }
  }
}
