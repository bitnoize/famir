import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { redirectorPageSchema } from '@famir/database'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from './redirector.js'

const DEFAULT_PAGE = ``

export const createRedirectorDataSchema: JSONSchemaType<CreateRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId', 'page'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      default: DEFAULT_PAGE
    }
  },
  additionalProperties: false
} as const

export const readRedirectorDataSchema: JSONSchemaType<ReadRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

export const updateRedirectorDataSchema: JSONSchemaType<UpdateRedirectorData> = {
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

export const deleteRedirectorDataSchema: JSONSchemaType<DeleteRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listRedirectorsDataSchema: JSONSchemaType<ListRedirectorsData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
