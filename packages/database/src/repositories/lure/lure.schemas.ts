import { JSONSchemaType, customIdentSchema } from '@famir/common'
import {
  CreateLureModel,
  DeleteLureModel,
  ListLureModels,
  ReadLureModel,
  SwitchLureModel
} from '@famir/domain'

export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const createLureModelSchema: JSONSchemaType<CreateLureModel> = {
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

export const readLureModelSchema: JSONSchemaType<ReadLureModel> = {
  type: 'object',
  required: ['campaignId', 'lureId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema
  },
  additionalProperties: false
} as const

export const switchLureModelSchema: JSONSchemaType<SwitchLureModel> = {
  type: 'object',
  required: ['campaignId', 'lureId'],
  properties: {
    campaignId: customIdentSchema,
    lureId: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteLureModelSchema: JSONSchemaType<DeleteLureModel> = {
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

export const listLureModelsSchema: JSONSchemaType<ListLureModels> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
