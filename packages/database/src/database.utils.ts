import { arrayIncludes, filterSecrets } from '@famir/common'
import { DATABASE_STATUS_CODES, DatabaseStatusCode, ValidatorSchemas } from '@famir/domain'
import { DatabaseConfig, DatabaseConnectorOptions, DatabaseRepositoryOptions } from './database.js'
import {
  messageHeadersSchema,
  messageRequestCookiesSchema,
  messageResponseCookiesSchema
} from './repositories/index.js'

export const internalSchemas: ValidatorSchemas = {
  'message-headers': messageHeadersSchema,
  'message-request-cookies': messageRequestCookiesSchema,
  'message-response-cookies': messageResponseCookiesSchema
}

export function buildConnectorOptions(data: DatabaseConfig): DatabaseConnectorOptions {
  return {
    connectionUrl: data.DATABASE_CONNECTION_URL
  }
}

export function buildRepositoryOptions(data: DatabaseConfig): DatabaseRepositoryOptions {
  return {
    prefix: data.DATABASE_PREFIX
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, ['connectionUrl'])
}

export function parseStatusReply(status: string): [DatabaseStatusCode, string] {
  const [code, message] = status.split(/\s+(.*)/, 2)

  if (code === undefined) {
    throw new Error(`Status code not defined`)
  }

  if (!arrayIncludes(DATABASE_STATUS_CODES, code)) {
    throw new Error(`Unknown status code: "${code}"`)
  }

  if (message === undefined) {
    throw new Error(`Status message not defined`)
  }

  return [code, message]
}
