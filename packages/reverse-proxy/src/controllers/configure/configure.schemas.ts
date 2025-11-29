import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { ConfigureData } from './configure.js'

export const configureDataSchema: JSONSchemaType<ConfigureData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'clientIp'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    clientIp: {
      type: 'string',
      default: ''
    }
  },
  additionalProperties: false
} as const
