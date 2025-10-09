import { JSONSchemaType } from '@famir/common'
import {
  CreateRedirectorModel,
  DeleteRedirectorModel,
  ListRedirectorModels,
  ReadRedirectorModel,
  UpdateRedirectorModel
} from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const

export const createRedirectorModelSchema: JSONSchemaType<CreateRedirectorModel> = {
  type: 'object',
  required: ['campaignId', 'redirectorId', 'page'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      default: '' // FIXME
    }
  },
  additionalProperties: false
} as const

export const readRedirectorModelSchema: JSONSchemaType<ReadRedirectorModel> = {
  type: 'object',
  required: ['campaignId', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

export const updateRedirectorModelSchema: JSONSchemaType<UpdateRedirectorModel> = {
  type: 'object',
  required: ['campaignId', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const deleteRedirectorModelSchema: JSONSchemaType<DeleteRedirectorModel> = {
  type: 'object',
  required: ['campaignId', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listRedirectorModelsSchema: JSONSchemaType<ListRedirectorModels> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
