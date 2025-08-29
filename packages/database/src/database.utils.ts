import { arrayIncludes, MalformDataError } from '@famir/common'
import { ValidatorAssertSchema } from '@famir/validator'
import { DATABASE_ERROR_CODES, DatabaseError } from './database.errors.js'
import { DatabaseConfig, DatabaseOptions } from './database.js'

export function buildConnectorOptions(data: DatabaseConfig): DatabaseOptions {
  return {
    connectionUrl: data.DATABASE_CONNECTION_URL
  }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function validateJson<T>(
  assertSchema: ValidatorAssertSchema,
  schema: string,
  data: unknown,
  entry: string
): asserts data is T {
  try {
    assertSchema<T>(schema, data, entry)
  } catch (error) {
    throw new DatabaseError(
      'BAD_PARAMS',
      {
        cause: error
      },
      `Validation JSON failed`
    )
  }
}

export const STATUS_CODES = [...DATABASE_ERROR_CODES, 'OK'] as const

export type StatusCode = (typeof STATUS_CODES)[number]

export function assertStatusCode(data: unknown, entry = 'code'): asserts data is StatusCode {
  const test = data != null && typeof data === 'string' && arrayIncludes(STATUS_CODES, data)

  if (!test) {
    throw new MalformDataError(entry, data, `Unknown status code`)
  }
}

export function parseStatusReply(status: string): [StatusCode, string] {
  try {
    const [code, message] = status.split(/\s+(.*)/)

    assertStatusCode(code)

    return [code, message ?? '']
  } catch (error) {
    throw new DatabaseError(
      'INTERNAL_ERROR',
      {
        status,
        cause: error
      },
      `Parse status reply failed`
    )
  }
}
