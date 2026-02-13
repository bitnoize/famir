import { lurePathSchema } from '@famir/database'
import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from './lure.js'

const createLureDataSchema: JSONSchemaType<CreateLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'path', 'redirectorId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const readLureDataSchema: JSONSchemaType<ReadLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema
  },
  additionalProperties: false
} as const

const switchLureDataSchema: JSONSchemaType<SwitchLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const deleteLureDataSchema: JSONSchemaType<DeleteLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'path', 'redirectorId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const listLuresDataSchema: JSONSchemaType<ListLuresData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const

export const lureSchemas: ValidatorSchemas = {
  'console-create-lure-data': createLureDataSchema,
  'console-read-lure-data': readLureDataSchema,
  'console-switch-lure-data': switchLureDataSchema,
  'console-delete-lure-data': deleteLureDataSchema,
  'console-list-lures-data': listLuresDataSchema
} as const
