import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { SetupMirrorData } from './use-cases/index.js'

export const setupMirrorDataSchema: JSONSchemaType<SetupMirrorData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const
