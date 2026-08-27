import {
  JSONSchemaType,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawProxy } from './proxy.functions.js'

/**
 * JSON Schema for validating a proxy URL.
 *
 * @category Proxy
 */
export const proxyUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 2,
  maxLength: 256,
} as const

/**
 * @category Proxy
 * @internal
 */
export const rawProxySchema: JSONSchemaType<RawProxy> = {
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
