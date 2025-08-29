import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import {
  messageHeadersSchema,
  messageMethodSchema,
  messageRequestCookiesSchema,
  messageResponseCookiesSchema
} from './repositories/index.js'

export const configDatabaseConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string'
} as const

export const databaseSchemas: ValidatorSchemas = {
  'message-method': messageMethodSchema,
  'message-headers': messageHeadersSchema,
  'message-request-cookies': messageRequestCookiesSchema,
  'message-response-cookies': messageResponseCookiesSchema
}
