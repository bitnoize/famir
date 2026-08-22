import { lurePathSchema } from '@famir/database'
import { JSONSchemaType, customIdentSchema } from '@famir/validator'
import {
  CreateLureArgs,
  DeleteLureArgs,
  ListLuresArgs,
  MakeLureUrlArgs,
  ReadLureArgs,
  ToggleLureArgs,
} from './lure.js'

/**
 * JSON Schema for validating a create lure args.
 *
 * @category Lure
 * @internal
 */
export const createLureArgsSchema: JSONSchemaType<CreateLureArgs> = {
  type: 'object',
  required: ['_', 'path'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema, customIdentSchema],
      minItems: 3,
      maxItems: 3,
    },
    path: lurePathSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a read lure args.
 *
 * @category Lure
 * @internal
 */
export const readLureArgsSchema: JSONSchemaType<ReadLureArgs> = {
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
 * JSON Schema for validating a toggle lure args.
 *
 * @category Lure
 * @internal
 */
export const toggleLureArgsSchema: JSONSchemaType<ToggleLureArgs> = {
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
 * JSON Schema for validating a delete lure args.
 *
 * @category Lure
 * @internal
 */
export const deleteLureArgsSchema: JSONSchemaType<DeleteLureArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema, customIdentSchema],
      minItems: 3,
      maxItems: 3,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list lures args.
 *
 * @category Lure
 * @internal
 */
export const listLuresArgsSchema: JSONSchemaType<ListLuresArgs> = {
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

/**
 * JSON Schema for validating a make lure url args.
 *
 * @category Lure
 * @internal
 */
export const makeLureUrlArgsSchema: JSONSchemaType<MakeLureUrlArgs> = {
  type: 'object',
  required: ['_', 'params'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema, customIdentSchema],
      minItems: 3,
      maxItems: 3,
    },
    params: {
      type: 'string',
    },
  },
  additionalProperties: false,
} as const
