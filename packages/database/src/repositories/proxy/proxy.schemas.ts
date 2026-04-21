import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { RawProxy } from './proxy.functions.js'

/**
 * @category Proxy
 * @internal
 */
const rawProxySchema: JSONSchemaType<RawProxy> = {
  type: 'object',
  required: ['campaign_id', 'proxy_id', 'url', 'is_enabled', 'message_count', 'created_at'],
  properties: {
    campaign_id: {
      type: 'string',
    },
    proxy_id: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    is_enabled: {
      type: 'integer',
    },
    message_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Proxy
 * @internal
 */
export const proxyUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
} as const

/**
 * @category Proxy
 * @internal
 */
export const proxySchemas: ValidatorSchemas = {
  'database-raw-proxy': rawProxySchema,
} as const
