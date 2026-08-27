import { JSONSchemaType, booleanSchema } from '@famir/validator'
import {
  AssetsArgs,
  CleanupDatabaseArgs,
  DeleteEdgeServerConfigArgs,
  GetDatabaseInfoArgs,
  GetProducerInfoArgs,
  LoadDatabaseFunctionsArgs,
  ReadEdgeServerConfigArgs,
  ReadEdgeServerUpstreamsArgs,
  UpsertEdgeServerConfigArgs,
} from './system.js'

/**
 * @category Database
 * @internal
 */
export const assetsArgsSchema: JSONSchemaType<AssetsArgs> = {
  type: 'object',
  required: ['_', 'assetName'],
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
 * @category Database
 * @internal
 */
export const loadDatabaseFunctionsArgsSchema: JSONSchemaType<LoadDatabaseFunctionsArgs> = {
  type: 'object',
  required: ['_', 'force'],
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
 * @category Database
 * @internal
 */
export const cleanupDatabaseArgsSchema: JSONSchemaType<CleanupDatabaseArgs> = {
  type: 'object',
  required: ['_', 'force'],
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
 * @category System
 * @internal
 */
export const upsertEdgeServerConfigArgsSchema: JSONSchemaType<UpsertEdgeServerConfigArgs> = {
  type: 'object',
  required: ['_', 'assetName', 'force'],
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
    force: booleanSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category System
 * @internal
 */
export const readEdgeServerConfigArgsSchema: JSONSchemaType<ReadEdgeServerConfigArgs> = {
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
 * @category System
 * @internal
 */
export const deleteEdgeServerConfigArgsSchema: JSONSchemaType<DeleteEdgeServerConfigArgs> = {
  type: 'object',
  required: ['_', 'force'],
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
 * @category System
 * @internal
 */
export const readEdgeServerUpstreamsArgsSchema: JSONSchemaType<ReadEdgeServerUpstreamsArgs> = {
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
