import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import {
  messageHeadersSchema,
  messageMethodSchema,
  messageRequestCookiesSchema,
  messageResponseCookiesSchema
} from './repositories/index.js'

export const configDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/0'
} as const

export const configDatabasePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'famir'
} as const

export const databaseSchemas: ValidatorSchemas = {
  'message-method': messageMethodSchema,
  'message-headers': messageHeadersSchema,
  'message-request-cookies': messageRequestCookiesSchema,
  'message-response-cookies': messageResponseCookiesSchema
}
