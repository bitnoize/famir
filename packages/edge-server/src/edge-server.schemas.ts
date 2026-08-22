import { JSONSchemaType } from '@famir/validator'
import { CaddyEdgeServerConfig, CaddyEdgeServerUpstream } from './edge-server.js'

/**
 * JSON Schema for validating a Caddy edge-server api url.
 *
 * @internal
 */
const caddyEdgeServerApiUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'http://localhost:2019',
} as const

/**
 * JSON Schema for validating a complete Caddy edge-server configuration.
 *
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

/**
 * JSON Schema for validating a Caddy edge-server upstream.
 *
 * @internal
 */
export const caddyEdgeServerUpstreamSchema: JSONSchemaType<CaddyEdgeServerUpstream> = {
  type: 'object',
  required: ['address', 'num_requests', 'fails'],
  properties: {
    address: {
      type: 'string',
    },
    num_requests: {
      type: 'integer',
    },
    fails: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list of Caddy edge-server upstreams.
 *
 * @internal
 */
export const caddyEdgeServerUpstreamsSchema: JSONSchemaType<CaddyEdgeServerUpstream[]> = {
  type: 'array',
  items: caddyEdgeServerUpstreamSchema,
} as const
