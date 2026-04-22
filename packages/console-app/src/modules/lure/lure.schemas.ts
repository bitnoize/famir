import { lurePathSchema, redirectorParamsSchema } from '@famir/database'
import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  MakeLureUrlData,
  ReadLureData,
  SwitchLureData,
} from './lure.js'

/**
 * @category Lure
 * @internal
 */
const createLureDataSchema: JSONSchemaType<CreateLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'path', 'redirectorId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Lure
 * @internal
 */
const readLureDataSchema: JSONSchemaType<ReadLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Lure
 * @internal
 */
const switchLureDataSchema: JSONSchemaType<SwitchLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Lure
 * @internal
 */
const deleteLureDataSchema: JSONSchemaType<DeleteLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'redirectorId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    redirectorId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Lure
 * @internal
 */
const listLuresDataSchema: JSONSchemaType<ListLuresData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Lure
 * @internal
 */
const makeLureUrlDataSchema: JSONSchemaType<MakeLureUrlData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lureId', 'params'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    lureId: customIdentSchema,
    params: redirectorParamsSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Lure
 * @internal
 */
export const lureSchemas: ValidatorSchemas = {
  'console-create-lure-data': createLureDataSchema,
  'console-read-lure-data': readLureDataSchema,
  'console-switch-lure-data': switchLureDataSchema,
  'console-delete-lure-data': deleteLureDataSchema,
  'console-list-lures-data': listLuresDataSchema,
  'console-make-lure-url-data': makeLureUrlDataSchema,
} as const
