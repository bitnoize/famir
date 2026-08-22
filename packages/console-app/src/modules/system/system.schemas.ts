import { JSONSchemaType, booleanSchema } from '@famir/validator'
import {
  AssetsArgs,
  GetDatabaseInfoArgs,
  GetEdgeServerInfoArgs,
  GetProducerInfoArgs,
  LoadDatabaseFunctionsArgs,
} from './system.js'

/**
 * JSON Schema for validating an assets args.
 *
 * @category Database
 * @internal
 */
export const assetsArgsSchema: JSONSchemaType<AssetsArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
    assetName: {
      type: 'string',
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a get database info args.
 *
 * @category Database
 * @internal
 */
export const getDatabaseInfoArgsSchema: JSONSchemaType<GetDatabaseInfoArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a load database functions args.
 *
 * @category Database
 * @internal
 */
export const loadDatabaseFunctionsArgsSchema: JSONSchemaType<LoadDatabaseFunctionsArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
    force: booleanSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a get producer info args.
 *
 * @category Producer
 * @internal
 */
export const getProducerInfoArgsSchema: JSONSchemaType<GetProducerInfoArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a get edge-server info args.
 *
 * @category System
 * @internal
 */
export const getEdgeServerInfoArgsSchema: JSONSchemaType<GetEdgeServerInfoArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
  },
  additionalProperties: false,
} as const
