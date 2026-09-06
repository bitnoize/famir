import { JSONSchemaType } from '@famir/common'
import { CliReplServerConfig, NetReplServerConfig } from './repl-server.js'

/**
 * @internal
 */
const netReplServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: '127.0.0.1',
} as const

/**
 * @internal
 */
const netReplServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535,
  default: 5000,
} as const

/**
 * @internal
 */
const netReplServerMaxClientsSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 100,
  default: 10,
} as const

/**
 * @internal
 */
const netReplServerSocketTimeoutSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1000,
  maximum: 3600 * 1000,
  default: 15 * 60 * 1000,
} as const

/**
 * @internal
 */
const replServerUseColorsSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: true,
} as const

/**
 * @internal
 */
export const cliReplServerConfigSchema: JSONSchemaType<CliReplServerConfig> = {
  type: 'object',
  required: ['REPL_SERVER_USE_COLORS'],
  properties: {
    REPL_SERVER_USE_COLORS: replServerUseColorsSchema,
  },
  additionalProperties: false,
} as const

/**
 * @internal
 */
export const netReplServerConfigSchema: JSONSchemaType<NetReplServerConfig> = {
  type: 'object',
  required: [
    'REPL_SERVER_ADDRESS',
    'REPL_SERVER_PORT',
    'REPL_SERVER_MAX_CLIENTS',
    'REPL_SERVER_SOCKET_TIMEOUT',
    'REPL_SERVER_USE_COLORS',
  ],
  properties: {
    REPL_SERVER_ADDRESS: netReplServerAddressSchema,
    REPL_SERVER_PORT: netReplServerPortSchema,
    REPL_SERVER_MAX_CLIENTS: netReplServerMaxClientsSchema,
    REPL_SERVER_SOCKET_TIMEOUT: netReplServerSocketTimeoutSchema,
    REPL_SERVER_USE_COLORS: replServerUseColorsSchema,
  },
  additionalProperties: false,
} as const
