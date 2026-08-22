import { proxyUrlSchema } from '@famir/database'
import { JSONSchemaType, customIdentSchema } from '@famir/validator'
import {
  CreateProxyArgs,
  DeleteProxyArgs,
  ListProxiesArgs,
  ReadProxyArgs,
  ToggleProxyArgs,
} from './proxy.js'

/**
 * JSON Schema for validating a create proxy args.
 *
 * @category Proxy
 * @internal
 */
export const createProxyArgsSchema: JSONSchemaType<CreateProxyArgs> = {
  type: 'object',
  required: ['_', 'url'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    url: proxyUrlSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a read proxy args.
 *
 * @category Proxy
 * @internal
 */
export const readProxyArgsSchema: JSONSchemaType<ReadProxyArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a toggle proxy args.
 *
 * @category Proxy
 * @internal
 */
export const toggleProxyArgsSchema: JSONSchemaType<ToggleProxyArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a delete proxy args.
 *
 * @category Proxy
 * @internal
 */
export const deleteProxyArgsSchema: JSONSchemaType<DeleteProxyArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list proxies args.
 *
 * @category Proxy
 * @internal
 */
export const listProxiesArgsSchema: JSONSchemaType<ListProxiesArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
  },
  additionalProperties: false,
} as const
