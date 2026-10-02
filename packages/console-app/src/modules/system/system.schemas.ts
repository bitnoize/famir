import { JSONSchemaType, booleanSchema } from '@famir/common'
import {
  CleanupDatabaseArgs,
  GetDatabaseInfoArgs,
  GetProducerInfoArgs,
  LoadDatabaseFunctionsArgs,
  SystemAssetsArgs,
  SystemHelpArgs,
} from './system.js'

/**
 * @category System
 * @internal
 */
export const systemHelpArgsSchema: JSONSchemaType<SystemHelpArgs> = {
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
export const systemAssetsArgsSchema: JSONSchemaType<SystemAssetsArgs> = {
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
 * @category System
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
 * @category System
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
 * @category System
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
 * @category System
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
