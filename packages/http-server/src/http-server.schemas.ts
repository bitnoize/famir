import { JSONSchemaType } from '@famir/common'
import { NativeHttpServerConfig } from './http-server.js'

const nativeHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: '127.0.0.1',
} as const

const nativeHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535,
  default: 3000,
} as const

/**
 * @internal
 */
export const nativeHttpServerConfigSchema: JSONSchemaType<NativeHttpServerConfig> = {
  type: 'object',
  required: ['HTTP_SERVER_ADDRESS', 'HTTP_SERVER_PORT'],
  properties: {
    HTTP_SERVER_ADDRESS: nativeHttpServerAddressSchema,
    HTTP_SERVER_PORT: nativeHttpServerPortSchema,
  },
  additionalProperties: false,
} as const
