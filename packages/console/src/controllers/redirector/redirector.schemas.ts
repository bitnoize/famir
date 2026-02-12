import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { redirectorPageSchema } from '@famir/database'
import { ValidatorSchemas } from '@famir/validator'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from './redirector.js'

const DEFAULT_PAGE = ``

const createRedirectorDataSchema: JSONSchemaType<CreateRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId', 'page', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      default: DEFAULT_PAGE
    },
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const readRedirectorDataSchema: JSONSchemaType<ReadRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema
  },
  additionalProperties: false
} as const

const updateRedirectorDataSchema: JSONSchemaType<UpdateRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      nullable: true
    },
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const deleteRedirectorDataSchema: JSONSchemaType<DeleteRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const listRedirectorsDataSchema: JSONSchemaType<ListRedirectorsData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const

export const redirectorSchemas: ValidatorSchemas = {
  'console-create-redirector-data': createRedirectorDataSchema,
  'console-read-redirector-data': readRedirectorDataSchema,
  'console-update-redirector-data': updateRedirectorDataSchema,
  'console-delete-redirector-data': deleteRedirectorDataSchema,
  'console-list-redirectors-data': listRedirectorsDataSchema
} as const
