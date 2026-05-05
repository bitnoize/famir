import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawProxy } from './proxy.functions.js'

/**
 * Schema for validating a proxy URL.
 *
 * @category Proxy
 * @internal
 */
export const proxyUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * Schema for validating raw proxy data from Redis.
 *
 * @category Proxy
 * @internal
 */
const rawProxySchema: JSONSchemaType<RawProxy> = {
  type: 'object',
  required: ['campaign_id', 'proxy_id', 'url', 'is_enabled', 'message_count', 'created_at'],
  properties: {
    campaign_id: customIdentSchema,
    proxy_id: customIdentSchema,
    url: proxyUrlSchema,
    is_enabled: booleanSchema,
    message_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Collection of all schemas used by the proxy module.
 *
 * @category Proxy
 * @internal
 */
export const proxySchemas: ValidatorSchemas = {
  'database-raw-proxy': rawProxySchema,
} as const
