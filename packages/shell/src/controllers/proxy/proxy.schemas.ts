import { proxyUrlSchema } from '@famir/database'
import { JSONSchemaType, customIdentSchema } from '@famir/validator'
import {
  CreateProxyDto,
  DeleteProxyDto,
  DisableProxyDto,
  EnableProxyDto,
  ReadProxyDto
} from '../../use-cases/index.js'

export const createProxyDtoSchema: JSONSchemaType<CreateProxyDto> = {
  type: 'object',
  required: ['id', 'url'],
  properties: {
    id: customIdentSchema,
    url: proxyUrlSchema
  },
  additionalProperties: false
} as const

export const readProxyDtoSchema: JSONSchemaType<ReadProxyDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const

export const enableProxyDtoSchema: JSONSchemaType<EnableProxyDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const

export const disableProxyDtoSchema: JSONSchemaType<DisableProxyDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteProxyDtoSchema: JSONSchemaType<DeleteProxyDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const
