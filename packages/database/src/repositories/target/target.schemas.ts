import { JSONSchemaType, booleanSchema, customIdentSchema } from '@famir/common'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  UpdateTargetData
} from '@famir/domain'
import { RawFullTarget, RawTarget } from './target.functions.js'

export const rawTargetSchema: JSONSchemaType<RawTarget> = {
  type: 'object',
  required: [
    'campaign_id',
    'target_id',
    'is_landing',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    target_id: {
      type: 'string'
    },
    is_landing: {
      type: 'integer'
    },
    donor_secure: {
      type: 'integer'
    },
    donor_sub: {
      type: 'string'
    },
    donor_domain: {
      type: 'string'
    },
    donor_port: {
      type: 'integer'
    },
    mirror_secure: {
      type: 'integer'
    },
    mirror_sub: {
      type: 'string'
    },
    mirror_port: {
      type: 'integer'
    },
    is_enabled: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const rawFullTargetSchema: JSONSchemaType<RawFullTarget> = {
  type: 'object',
  required: [
    'campaign_id',
    'target_id',
    'is_landing',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'labels',
    'connect_timeout',
    'request_timeout',
    'streaming_timeout',
    'request_body_limit',
    'response_body_limit',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'success_redirect_url',
    'failure_redirect_url',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    target_id: {
      type: 'string'
    },
    is_landing: {
      type: 'integer'
    },
    donor_secure: {
      type: 'integer'
    },
    donor_sub: {
      type: 'string'
    },
    donor_domain: {
      type: 'string'
    },
    donor_port: {
      type: 'integer'
    },
    mirror_secure: {
      type: 'integer'
    },
    mirror_sub: {
      type: 'string'
    },
    mirror_port: {
      type: 'integer'
    },
    labels: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    connect_timeout: {
      type: 'integer'
    },
    request_timeout: {
      type: 'integer'
    },
    streaming_timeout: {
      type: 'integer'
    },
    request_body_limit: {
      type: 'integer'
    },
    response_body_limit: {
      type: 'integer'
    },
    main_page: {
      type: 'string'
    },
    not_found_page: {
      type: 'string'
    },
    favicon_ico: {
      type: 'string'
    },
    robots_txt: {
      type: 'string'
    },
    sitemap_xml: {
      type: 'string'
    },
    success_redirect_url: {
      type: 'string'
    },
    failure_redirect_url: {
      type: 'string'
    },
    is_enabled: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const targetSubSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const targetDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const targetPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535
} as const

export const targetLabelSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64
}

export const targetLabelsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: targetLabelSchema
} as const

export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000
} as const

export const targetRequestTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1 * 1000,
  maximum: 2 * 60 * 1000
} as const

export const targetStreamingTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 24 * 3600 * 1000
} as const

export const targetRequestBodyLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1024,
  maximum: 1024 * 1024 * 1024
} as const

export const targetResponseBodyLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1024,
  maximum: 1024 * 1024 * 1024
} as const

export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024
} as const

export const targetRedirectUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256
} as const

export const createTargetDataSchema: JSONSchemaType<CreateTargetData> = {
  type: 'object',
  required: [
    'campaignId',
    'targetId',
    'isLanding',
    'donorSecure',
    'donorSub',
    'donorDomain',
    'donorPort',
    'mirrorSecure',
    'mirrorSub',
    'mirrorPort',
    'connectTimeout',
    'requestTimeout',
    'streamingTimeout',
    'requestBodyLimit',
    'responseBodyLimit',
    'mainPage',
    'notFoundPage',
    'faviconIco',
    'robotsTxt',
    'sitemapXml',
    'successRedirectUrl',
    'failureRedirectUrl'
  ],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    isLanding: booleanSchema,
    donorSecure: booleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: targetPortSchema,
    mirrorSecure: booleanSchema,
    mirrorSub: targetSubSchema,
    mirrorPort: targetPortSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      default: 1 * 1000
    },
    requestTimeout: {
      ...targetRequestTimeoutSchema,
      default: 10 * 1000
    },
    streamingTimeout: {
      ...targetStreamingTimeoutSchema,
      default: 3600 * 1000
    },
    requestBodyLimit: {
      ...targetRequestBodyLimitSchema,
      default: 10 * 1024 * 1024
    },
    responseBodyLimit: {
      ...targetResponseBodyLimitSchema,
      default: 10 * 1024 * 1024
    },
    mainPage: {
      ...targetContentSchema,
      default: ''
    },
    notFoundPage: {
      ...targetContentSchema,
      default: ''
    },
    faviconIco: {
      ...targetContentSchema,
      default: ''
    },
    robotsTxt: {
      ...targetContentSchema,
      default: ''
    },
    sitemapXml: {
      ...targetContentSchema,
      default: ''
    },
    successRedirectUrl: {
      ...targetRedirectUrlSchema,
      default: '/'
    },
    failureRedirectUrl: {
      ...targetRedirectUrlSchema,
      default: '/'
    }
  },
  additionalProperties: false
} as const

export const readTargetDataSchema: JSONSchemaType<ReadTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const updateTargetDataSchema: JSONSchemaType<UpdateTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      nullable: true
    },
    requestTimeout: {
      ...targetRequestTimeoutSchema,
      nullable: true
    },
    streamingTimeout: {
      ...targetStreamingTimeoutSchema,
      nullable: true
    },
    requestBodyLimit: {
      ...targetRequestBodyLimitSchema,
      nullable: true
    },
    responseBodyLimit: {
      ...targetResponseBodyLimitSchema,
      nullable: true
    },
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

export const switchTargetDataSchema: JSONSchemaType<SwitchTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const actionTargetLabelDataSchema: JSONSchemaType<ActionTargetLabelData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'label'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    label: targetLabelSchema
  },
  additionalProperties: false
} as const

export const deleteTargetDataSchema: JSONSchemaType<DeleteTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listTargetsDataSchema: JSONSchemaType<ListTargetsData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
