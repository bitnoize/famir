import { JSONSchemaType, customIdentSchema } from '@famir/common'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from '@famir/domain'
import { RawRedirector } from './redirector.functions.js'

export const rawRedirectorSchema: JSONSchemaType<RawRedirector> = {
  type: 'object',
  required: ['campaign_id', 'redirector_id', 'page', 'lure_count', 'created_at', 'updated_at'],
  properties: {
    campaign_id: {
      type: 'string'
    },
    redirector_id: {
      type: 'string'
    },
    page: {
      type: 'string'
    },
    lure_count: {
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

export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const

export const createRedirectorDataSchema: JSONSchemaType<CreateRedirectorData> = {
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
