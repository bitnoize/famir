import { JSONSchemaType } from '@famir/validator'
import { CurlHttpClientConfig } from './http-client.js'

/**
 * JSON Schema for validating a Curl http-client verbose flag.
 *
 * @internal
 */
const configHttpClientVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
} as const

/**
 * JSON Schema for validating a complete Curl http-client configuration.
 *
 * @internal
 */
export const curlHttpClientConfigSchema: JSONSchemaType<CurlHttpClientConfig> = {
  type: 'object',
  required: ['HTTP_CLIENT_VERBOSE'],
  properties: {
    HTTP_CLIENT_VERBOSE: configHttpClientVerboseSchema,
  },
  additionalProperties: false,
} as const
