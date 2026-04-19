import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { TARGET_ACCESS_LEVELS, TargetAccessLevel } from '../../models/index.js'
import { RawFullTarget, RawTarget } from './target.functions.js'

/**
 * @category Schemas
 * @internal
 */
const rawTargetSchema: JSONSchemaType<RawTarget> = {
  type: 'object',
  required: [
    'campaign_id',
    'target_id',
    'access_level',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_domain',
    'mirror_port',
    'is_enabled',
    'message_count',
    'created_at',
  ],
  properties: {
    campaign_id: {
      type: 'string',
    },
    target_id: {
      type: 'string',
    },
    access_level: {
      type: 'string',
    },
    donor_secure: {
      type: 'integer',
    },
    donor_sub: {
      type: 'string',
    },
    donor_domain: {
      type: 'string',
    },
    donor_port: {
      type: 'integer',
    },
    mirror_secure: {
      type: 'integer',
    },
    mirror_sub: {
      type: 'string',
    },
    mirror_domain: {
      type: 'string',
    },
    mirror_port: {
      type: 'integer',
    },
    is_enabled: {
      type: 'integer',
    },
    message_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Schemas
 * @internal
 */
const rawFullTargetSchema: JSONSchemaType<RawFullTarget> = {
  type: 'object',
  required: [
    'campaign_id',
    'target_id',
    'access_level',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_domain',
    'mirror_port',
    'labels',
    'connect_timeout',
    'simple_timeout',
    'stream_timeout',
    'headers_size_limit',
    'body_size_limit',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'allow_websockets',
    'is_enabled',
    'message_count',
    'created_at',
  ],
  properties: {
    campaign_id: {
      type: 'string',
    },
    target_id: {
      type: 'string',
    },
    access_level: {
      type: 'string',
    },
    donor_secure: {
      type: 'integer',
    },
    donor_sub: {
      type: 'string',
    },
    donor_domain: {
      type: 'string',
    },
    donor_port: {
      type: 'integer',
    },
    mirror_secure: {
      type: 'integer',
    },
    mirror_sub: {
      type: 'string',
    },
    mirror_domain: {
      type: 'string',
    },
    mirror_port: {
      type: 'integer',
    },
    labels: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    connect_timeout: {
      type: 'integer',
    },
    simple_timeout: {
      type: 'integer',
    },
    stream_timeout: {
      type: 'integer',
    },
    headers_size_limit: {
      type: 'integer',
    },
    body_size_limit: {
      type: 'integer',
    },
    main_page: {
      type: 'string',
    },
    not_found_page: {
      type: 'string',
    },
    favicon_ico: {
      type: 'string',
    },
    robots_txt: {
      type: 'string',
    },
    sitemap_xml: {
      type: 'string',
    },
    allow_websockets: {
      type: 'number',
    },
    is_enabled: {
      type: 'integer',
    },
    message_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetAccessLevelSchema: JSONSchemaType<TargetAccessLevel> = {
  type: 'string',
  enum: [...TARGET_ACCESS_LEVELS],
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetSubSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetLabelSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64,
}

/**
 * @category Schemas
 * @internal
 */
export const targetLabelsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: targetLabelSchema,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetSimpleTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 5 * 60 * 1000,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetStreamTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetHeadersSizeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1024 * 1024,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetBodySizeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1024 * 1024 * 1024,
} as const

/**
 * @category Schemas
 * @internal
 */
export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024,
} as const

/**
 * @category Utils
 * @internal
 */
export const targetSchemas: ValidatorSchemas = {
  'database-raw-target': rawTargetSchema,
  'database-raw-full-target': rawFullTargetSchema,
  'database-target-access-level': targetAccessLevelSchema,
} as const
