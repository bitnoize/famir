import { JSONSchemaType } from '@famir/common'
import { customIdentSchema } from '@famir/validator'
import { ReadCampaignTargetData } from './use-cases/index.js'

export const readCampaignTargetDataSchema: JSONSchemaType<ReadCampaignTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const
