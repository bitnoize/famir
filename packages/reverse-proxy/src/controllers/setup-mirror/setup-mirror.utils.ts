import { HttpServerError, ValidatorAssertSchema, ValidatorSchemas } from '@famir/domain'
import { setupMirrorHeadersSchema } from './setup-mirror.schemas.js'
import { SetupMirrorHeaders } from './use-cases/index.js'

export const addSchemas: ValidatorSchemas = {
  'setup-mirror-headers': setupMirrorHeadersSchema
}

export function validateSetupMirrorHeaders(
  assertSchema: ValidatorAssertSchema,
  headers: unknown
): asserts headers is SetupMirrorHeaders {
  try {
    assertSchema<SetupMirrorHeaders>('setup-mirror-headers', headers)
  } catch (error) {
    throw new HttpServerError(`SetupMirrorHeaders validation failed`, {
      cause: error,
      code: 'SERVICE_UNAVAILABLE',
      status: 503
    })
  }
}
