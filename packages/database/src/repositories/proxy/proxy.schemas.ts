import { JSONSchemaType } from '@famir/common'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData
} from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const proxyUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const createProxyDataSchema: JSONSchemaType<CreateProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'url'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    url: proxyUrlSchema
  },
  additionalProperties: false
} as const

export const readProxyDataSchema: JSONSchemaType<ReadProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

export const switchProxyDataSchema: JSONSchemaType<SwitchProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteProxyDataSchema: JSONSchemaType<DeleteProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listProxiesDataSchema: JSONSchemaType<ListProxiesData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
