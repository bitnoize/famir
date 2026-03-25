import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { LandingLurePayload, LandingUpgradePayload } from './authorize.js'

const landingUpgradePayloadSchema: JSONSchemaType<LandingUpgradePayload> = {
  type: 'object',
  required: ['lure_id', 'session_id', 'secret', 'back_url'],
  properties: {
    lure_id: customIdentSchema,
    session_id: randomIdentSchema,
    secret: randomIdentSchema,
    back_url: {
      type: 'string',
      minLength: 1,
      maxLength: 255
    }
  },
  additionalProperties: false
} as const

const landingLurePayloadSchema: JSONSchemaType<LandingLurePayload> = {
  type: 'object',
  required: [],
  additionalProperties: {
    type: 'string',
    minLength: 1,
    maxLength: 100
  }
} as const

export const authorizeSchemas: ValidatorSchemas = {
  'reverse-session-cookie': randomIdentSchema,
  'reverse-landing-upgrade-payload': landingUpgradePayloadSchema,
  'reverse-landing-lure-payload': landingLurePayloadSchema
} as const
