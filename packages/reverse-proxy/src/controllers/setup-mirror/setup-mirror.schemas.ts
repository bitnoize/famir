import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'
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

export const setupMirrorSchemas: ValidatorSchemas = {
  'reverse-proxy-setup-mirror-data': setupMirrorDataSchema
} as const
