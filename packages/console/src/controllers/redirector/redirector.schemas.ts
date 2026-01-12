import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { campaignLockCodeSchema, redirectorPageSchema } from '@famir/database'
import { ValidatorSchemas } from '@famir/domain'
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
  required: ['campaignId', 'redirectorId', 'page', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      default: DEFAULT_PAGE
    },
    lockCode: campaignLockCodeSchema
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
  required: ['campaignId', 'redirectorId', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      nullable: true
    },
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

const deleteRedirectorDataSchema: JSONSchemaType<DeleteRedirectorData> = {
  type: 'object',
  required: ['campaignId', 'redirectorId', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    redirectorId: customIdentSchema,
    lockCode: campaignLockCodeSchema
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
