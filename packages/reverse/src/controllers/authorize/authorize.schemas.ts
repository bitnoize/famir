import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { LandingLureData, LandingUpgradeData } from './authorize.js'

const landingUpgradeDataSchema: JSONSchemaType<LandingUpgradeData> = {
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

const landingLureDataSchema: JSONSchemaType<LandingLureData> = {
  type: 'object',
  required: [],
  properties: {
    og_title: {
      type: 'string',
      nullable: true
    },
    og_description: {
      type: 'string',
      nullable: true
    },
    og_image: {
      type: 'string',
      nullable: true
    },
    og_url: {
      type: 'string',
      nullable: true
    },
    upgrade_url: {
      type: 'string',
      nullable: true
    },
    back_url: {
      type: 'string',
      nullable: true
    }
  },
  additionalProperties: {
    type: 'string'
  }
} as const

export const authorizeSchemas: ValidatorSchemas = {
  'reverse-session-cookie': randomIdentSchema,
  'reverse-landing-upgrade-data': landingUpgradeDataSchema,
  'reverse-landing-lure-data': landingLureDataSchema
} as const
