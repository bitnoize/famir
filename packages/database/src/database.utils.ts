import { arrayIncludes } from '@famir/common'
import { REPOSITORY_STATUS_CODES, RepositoryStatusCode } from '@famir/domain'
import { DatabaseConfig, DatabaseOptions } from './database.js'

export function buildConnectorOptions(data: DatabaseConfig): DatabaseOptions {
  return {
    connectionUrl: data.DATABASE_CONNECTION_URL
  }
}

/*
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function validateJson<T>(
  assertSchema: ValidatorAssertSchema,
  schema: string,
  data: unknown
): asserts data is T {
  try {
    assertSchema<T>(schema, data)
  } catch (error) {
    throw new DatabaseError(
      {
        cause: error
      },
      `Validation JSON failed`
    )
  }
}
*/

export function parseStatusReply(status: string): [RepositoryStatusCode, string] {
  const [code, message] = status.split(/\s+(.*)/, 2)

  if (code === undefined) {
    throw new Error(`Status code not defined`)
  }

  if (!arrayIncludes(REPOSITORY_STATUS_CODES, code)) {
    throw new Error(`Unknown status code: "${code}"`)
  }

  if (message === undefined) {
    throw new Error(`Status message not defined`)
  }

  return [code, message]
}
