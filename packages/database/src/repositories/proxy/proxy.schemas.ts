import { JSONSchemaType, customIdentSchema } from '@famir/common'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData
} from '@famir/domain'
import { RawProxy } from './proxy.functions.js'

export const rawProxySchema: JSONSchemaType<RawProxy> = {
  type: 'object',
  required: [
    'campaign_id',
    'proxy_id',
    'url',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    proxy_id: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    is_enabled: {
      type: 'integer'
    },
    message_count: {
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
