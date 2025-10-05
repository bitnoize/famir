import { HttpServerError, ValidatorAssertSchema, ValidatorSchemas } from '@famir/domain'
import { configurationDataSchema } from './configuration.schemas.js'
import { ConfigurationData } from './use-cases/index.js'

export const addSchemas: ValidatorSchemas = {
  'configuration-data': configurationDataSchema
}

export function validateConfigurationData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ConfigurationData {
  try {
    assertSchema<ConfigurationData>('configuration-data', data)
  } catch (error) {
    throw new HttpServerError(`ConfigurationData validation failed`, {
      cause: error,
      code: 'SERVICE_UNAVAILABLE',
      status: 503
    })
  }
}
