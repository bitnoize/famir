import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { SetupMirrorData } from './setup-mirror.js'

export const setupMirrorDataSchema: JSONSchemaType<SetupMirrorData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
  },
  additionalProperties: false
} as const
