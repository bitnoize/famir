import { JSONSchemaType } from '@famir/common'
import {
  CreateProxyModel,
  DeleteProxyModel,
  ListProxyModels,
  ReadProxyModel,
  SwitchProxyModel
} from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const proxyUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const createProxyModelSchema: JSONSchemaType<CreateProxyModel> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'url'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    url: proxyUrlSchema
  },
  additionalProperties: false
} as const

export const readProxyModelSchema: JSONSchemaType<ReadProxyModel> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

export const switchProxyModelSchema: JSONSchemaType<SwitchProxyModel> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteProxyModelSchema: JSONSchemaType<DeleteProxyModel> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listProxyModelsSchema: JSONSchemaType<ListProxyModels> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
