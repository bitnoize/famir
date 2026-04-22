import { proxyUrlSchema } from '@famir/database'
import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData,
} from './proxy.js'

/**
 * @category Proxy
 * @internal
 */
const createProxyDataSchema: JSONSchemaType<CreateProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'url', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    url: proxyUrlSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Proxy
 * @internal
 */
const readProxyDataSchema: JSONSchemaType<ReadProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Proxy
 * @internal
 */
const switchProxyDataSchema: JSONSchemaType<SwitchProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Proxy
 * @internal
 */
const deleteProxyDataSchema: JSONSchemaType<DeleteProxyData> = {
  type: 'object',
  required: ['campaignId', 'proxyId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    proxyId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Proxy
 * @internal
 */
const listProxiesDataSchema: JSONSchemaType<ListProxiesData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Proxy
 * @internal
 */
export const proxySchemas: ValidatorSchemas = {
  'console-create-proxy-data': createProxyDataSchema,
  'console-read-proxy-data': readProxyDataSchema,
  'console-switch-proxy-data': switchProxyDataSchema,
  'console-delete-proxy-data': deleteProxyDataSchema,
  'console-list-proxies-data': listProxiesDataSchema,
} as const
