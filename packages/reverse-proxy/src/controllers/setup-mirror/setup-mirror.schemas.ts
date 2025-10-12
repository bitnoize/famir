import { JSONSchemaType } from '@famir/common'
import { customIdentSchema } from '@famir/validator'
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
