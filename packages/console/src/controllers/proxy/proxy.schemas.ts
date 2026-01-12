import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { campaignLockCodeSchema, proxyUrlSchema } from '@famir/database'
import { ValidatorSchemas } from '@famir/domain'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData
} from './proxy.js'

const createProxyDataSchema: JSONSchemaType<CreateProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'url', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    url: proxyUrlSchema,
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

const readProxyDataSchema: JSONSchemaType<ReadProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema
  },
  additionalProperties: false
} as const

const switchProxyDataSchema: JSONSchemaType<SwitchProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

const deleteProxyDataSchema: JSONSchemaType<DeleteProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

const listProxiesDataSchema: JSONSchemaType<ListProxiesData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const

export const proxySchemas: ValidatorSchemas = {
  'console-create-proxy-data': createProxyDataSchema,
  'console-read-proxy-data': readProxyDataSchema,
  'console-switch-proxy-data': switchProxyDataSchema,
  'console-delete-proxy-data': deleteProxyDataSchema,
  'console-list-proxies-data': listProxiesDataSchema
} as const
