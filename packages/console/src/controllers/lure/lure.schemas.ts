import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { lurePathSchema } from '@famir/database'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from './lure.js'

export const createLureDataSchema: JSONSchemaType<CreateLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'path', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

export const readLureDataSchema: JSONSchemaType<ReadLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema
  },
  additionalProperties: false
} as const

export const switchLureDataSchema: JSONSchemaType<SwitchLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteLureDataSchema: JSONSchemaType<DeleteLureData> = {
  type: 'object',
  required: ['campaignId', 'lureId', 'path', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listLuresDataSchema: JSONSchemaType<ListLuresData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
