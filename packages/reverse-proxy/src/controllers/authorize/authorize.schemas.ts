import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { LandingRedirectorData, LandingUpgradeData } from './authorize.js'

export const landingUpgradeDataSchema: JSONSchemaType<LandingUpgradeData> = {
  type: 'object',
  required: ['lure_id', 'secret'],
  properties: {
    lure_id: customIdentSchema,
    secret: randomIdentSchema
  },
  additionalProperties: false
} as const

export const landingRedirectorDataSchema: JSONSchemaType<LandingRedirectorData> = {
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
