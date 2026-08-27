import { JSONSchemaType } from '@famir/validator'
import { CaddyEdgeServerConfig } from './edge-server.js'

/**
 * @internal
 */
const caddyEdgeServerApiUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'http://localhost:2019',
} as const

/**
 * @internal
 */
export const caddyEdgeServerConfigSchema: JSONSchemaType<CaddyEdgeServerConfig> = {
  type: 'object',
  required: ['EDGE_SERVER_API_URL'],
  properties: {
    EDGE_SERVER_API_URL: caddyEdgeServerApiUrlSchema,
  },
  additionalProperties: false,
} as const
