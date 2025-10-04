import { JSONSchemaType } from '@famir/common'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

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
