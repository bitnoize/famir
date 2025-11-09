import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { SetupMirrorHeaders } from './use-cases/index.js'

export const setupMirrorHeadersSchema: JSONSchemaType<SetupMirrorHeaders> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const
