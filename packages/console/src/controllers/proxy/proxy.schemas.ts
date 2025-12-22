import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { proxyUrlSchema } from '@famir/database'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData
} from './proxy.js'

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
