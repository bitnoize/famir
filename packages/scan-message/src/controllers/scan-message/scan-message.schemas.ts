import { JSONSchemaType } from '@famir/common'
import { randomIdentSchema } from '@famir/validator'
import { ScanSessionDto } from '../../use-cases/index.js'

export const scanSessionDtoSchema: JSONSchemaType<ScanSessionDto> = {
  type: 'object',
  required: ['sessionId'],
  properties: {
    sessionId: randomIdentSchema,
  },
  additionalProperties: false
} as const

