import { JSONSchemaType, customIdentSchema } from '@famir/common'
import { ValidatorSchemas } from '@famir/validator'
import { SetupMirrorHeaders } from './setup-mirror.js'

export const setupMirrorHeadersSchema: JSONSchemaType<SetupMirrorHeaders> = {
  type: 'array',
  items: [customIdentSchema, customIdentSchema],
  minItems: 2,
  maxItems: 2,
  additionalItems: false
} as const

export const setupMirrorSchemas: ValidatorSchemas = {
  'reverse-proxy-setup-mirror-headers': setupMirrorHeadersSchema
} as const
