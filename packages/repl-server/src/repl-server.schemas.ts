import { JSONSchemaType } from '@famir/validator'
import { CliReplServerConfig, NetReplServerConfig } from './repl-server.js'

/**
 * JSON Schema for validating a Net repl-server address.
 *
 * @internal
 */
const netReplServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: '127.0.0.1',
} as const

/**
 * JSON Schema for validating a Net repl-server port.
 *
 * @internal
 */
const netReplServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535,
  default: 5000,
} as const

/**
 * JSON Schema for validating a Net repl-server maximum number of clients.
 *
 * @internal
 */
const netReplServerMaxClientsSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 100,
  default: 10,
} as const

/**
 * JSON Schema for validating a Net repl-server socket timeout.
 *
 * @internal
 */
const netReplServerSocketTimeoutSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1000,
  maximum: 3600 * 1000,
  default: 15 * 60 * 1000,
} as const

/**
 * JSON Schema for validating a repl-server color usage.
 *
 * @internal
 */
const replServerUseColorsSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: true,
} as const

/**
 * JSON Schema for validating a complete CLI repl-server configuration.
 *
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
 * JSON Schema for validating a complete Net repl-server configuration.
 *
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
