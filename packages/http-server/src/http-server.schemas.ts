import { JSONSchemaType } from '@famir/validator'
import { NativeHttpServerConfig } from './http-server.js'

/**
 * JSON Schema for validating a Native http-server address.
 *
 * @internal
 */
const nativeHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: '127.0.0.1',
} as const

/**
 * JSON Schema for validating a Native http-server port.
 *
 * @internal
 */
const nativeHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535,
  default: 3000,
} as const

/**
 * JSON Schema for validating a Native http-server verbose flag.
 *
 * @internal
 */
const nativeHttpServerVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
} as const

/**
 * JSON Schema for validating a complete Native http-server configuration.
 *
 * @internal
 */
export const nativeHttpServerConfigSchema: JSONSchemaType<NativeHttpServerConfig> = {
  type: 'object',
  required: ['HTTP_SERVER_ADDRESS', 'HTTP_SERVER_PORT', 'HTTP_SERVER_VERBOSE'],
  properties: {
    HTTP_SERVER_ADDRESS: nativeHttpServerAddressSchema,
    HTTP_SERVER_PORT: nativeHttpServerPortSchema,
    HTTP_SERVER_VERBOSE: nativeHttpServerVerboseSchema,
  },
  additionalProperties: false,
} as const
