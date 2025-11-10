import { JSONSchemaType, customIdentSchema } from '@famir/common'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from '@famir/domain'
import { RawLure } from './lure.functions.js'

export const rawLureSchema: JSONSchemaType<RawLure> = {
  type: 'object',
  required: [
    'campaign_id',
    'lure_id',
    'path',
    'redirector_id',
    'is_enabled',
    'session_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    lure_id: {
      type: 'string'
    },
    path: {
      type: 'string'
    },
    redirector_id: {
      type: 'string'
    },
    is_enabled: {
      type: 'integer'
    },
    session_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  }
} as const

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
