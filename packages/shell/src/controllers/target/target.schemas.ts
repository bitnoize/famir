import {
  targetContentSchema,
  targetDomainSchema,
  targetPortSchema,
  targetRedirectUrlSchema,
  targetSubSchema
} from '@famir/database'
import { JSONSchemaType, customIdentSchema, simpleBooleanSchema } from '@famir/validator'
import {
  CreateTargetDto,
  DeleteTargetDto,
  DisableTargetDto,
  EnableTargetDto,
  ReadTargetDto,
  UpdateTargetDto
} from '../../use-cases/index.js'

export const createTargetDtoSchema: JSONSchemaType<CreateTargetDto> = {
  type: 'object',
  required: [
    'id',
    'isLanding',
    'donorSecure',
    'donorSub',
    'donorDomain',
    'donorPort',
    'mirrorSecure',
    'mirrorSub',
    'mirrorDomain',
    'mirrorPort'
  ],
  properties: {
    id: customIdentSchema,
    isLanding: simpleBooleanSchema,
    donorSecure: simpleBooleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: targetPortSchema,
    mirrorSecure: simpleBooleanSchema,
    mirrorSub: targetSubSchema,
    mirrorDomain: targetDomainSchema,
    mirrorPort: targetPortSchema,
    mainPage: {
      ...targetContentSchema,
      nullable: true
    },
    notFoundPage: {
      ...targetContentSchema,
      nullable: true
    },
    faviconIco: {
      ...targetContentSchema,
      nullable: true
    },
    robotsTxt: {
      ...targetContentSchema,
      nullable: true
    },
    sitemapXml: {
      ...targetContentSchema,
      nullable: true
    },
    successRedirectUrl: {
      ...targetRedirectUrlSchema,
      nullable: true
    },
    failureRedirectUrl: {
      ...targetRedirectUrlSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const readTargetDtoSchema: JSONSchemaType<ReadTargetDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const

export const updateTargetDtoSchema: JSONSchemaType<UpdateTargetDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema,
    mainPage: {
      ...targetContentSchema,
      nullable: true
    },
    notFoundPage: {
      ...targetContentSchema,
      nullable: true
    },
    faviconIco: {
      ...targetContentSchema,
      nullable: true
    },
    robotsTxt: {
      ...targetContentSchema,
      nullable: true
    },
    sitemapXml: {
      ...targetContentSchema,
      nullable: true
    },
    successRedirectUrl: {
      ...targetRedirectUrlSchema,
      nullable: true
    },
    failureRedirectUrl: {
      ...targetRedirectUrlSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const enableTargetDtoSchema: JSONSchemaType<EnableTargetDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const

export const disableTargetDtoSchema: JSONSchemaType<DisableTargetDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteTargetDtoSchema: JSONSchemaType<DeleteTargetDto> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  },
  additionalProperties: false
} as const
