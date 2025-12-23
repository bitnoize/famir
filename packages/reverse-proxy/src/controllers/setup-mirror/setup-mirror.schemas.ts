import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { SetupMirrorData } from './setup-mirror.js'

export const setupMirrorDataSchema: JSONSchemaType<SetupMirrorData> = {
  type: 'object',
  required: ['campaign_id', 'target_id'],
  properties: {
    campaign_id: customIdentSchema,
    target_id: customIdentSchema
  },
  additionalProperties: false
} as const
