import { JSONSchemaType } from '@famir/common'
import { customIdentSchema } from '@famir/validator'
import { ConfigurationData } from './use-cases/index.js'

export const configurationDataSchema: JSONSchemaType<ConfigurationData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const
