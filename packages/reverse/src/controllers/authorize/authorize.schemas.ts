import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { LandingRedirectorData, LandingUpgradeData } from './authorize.js'

const landingUpgradeDataSchema: JSONSchemaType<LandingUpgradeData> = {
  type: 'object',
  required: ['lure_id', 'secret'],
  properties: {
    lure_id: customIdentSchema,
    secret: randomIdentSchema
  },
  additionalProperties: false
} as const

const landingRedirectorDataSchema: JSONSchemaType<LandingRedirectorData> = {
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
    }
  },
  additionalProperties: false
} as const

export const authorizeSchemas: ValidatorSchemas = {
  'reverse-proxy-session-cookie': randomIdentSchema,
  'reverse-proxy-landing-upgrade-data': landingUpgradeDataSchema,
  'reverse-proxy-landing-redirector-data': landingRedirectorDataSchema
} as const
