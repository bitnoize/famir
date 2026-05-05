import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawFullTarget, RawTarget } from './target.functions.js'
import {
  TARGET_ACCESS_LEVELS,
  TargetAccessLevel,
  TargetHosts,
  TargetLink,
} from './target.models.js'

/**
 * Schema for validating target access level.
 *
 * @category Target
 * @internal
 */
export const targetAccessLevelSchema: JSONSchemaType<TargetAccessLevel> = {
  type: 'string',
  enum: [...TARGET_ACCESS_LEVELS],
} as const

/**
 * Schema for validating target subdomain.
 *
 * @category Target
 * @internal
 */
export const targetSubSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * Schema for validating target domain.
 *
 * @category Target
 * @internal
 */
export const targetDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * Schema for validating target port.
 *
 * @category Target
 * @internal
 */
export const targetPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
} as const

/**
 * Schema for validating target label.
 *
 * @category Target
 * @internal
 */
export const targetLabelSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64,
}

/**
 * Schema for validating target labels.
 *
 * @category Target
 * @internal
 */
export const targetLabelsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: targetLabelSchema,
} as const

/**
 * Schema for validating target connect timeout.
 *
 * @category Target
 * @internal
 */
export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000,
} as const

/**
 * Schema for validating target simple timeout.
 *
 * @category Target
 * @internal
 */
export const targetSimpleTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 300 * 1000,
} as const

/**
 * Schema for validating target stream timeout.
 *
 * @category Target
 * @internal
 */
export const targetStreamTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000,
} as const

/**
 * Schema for validating target headers size limit.
 *
 * @category Target
 * @internal
 */
export const targetHeadersSizeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1024 * 1024,
} as const

/**
 * Schema for validating target body size limit.
 *
 * @category Target
 * @internal
 */
export const targetBodySizeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1024 * 1024 * 1024,
} as const

/**
 * Schema for validating target content size limit.
 *
 * @category Target
 * @internal
 */
export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024,
} as const

/**
 * Schema for validating raw target data from Redis.
 *
 * @category Target
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
    campaign_id: customIdentSchema,
    target_id: customIdentSchema,
    access_level: targetAccessLevelSchema,
    donor_secure: booleanSchema,
    donor_sub: targetSubSchema,
    donor_domain: targetDomainSchema,
    donor_port: targetPortSchema,
    mirror_secure: booleanSchema,
    mirror_sub: targetSubSchema,
    mirror_domain: targetDomainSchema,
    mirror_port: targetPortSchema,
    is_enabled: booleanSchema,
    message_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Schema for validating raw full target data from Redis.
 *
 * @category Target
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
    campaign_id: customIdentSchema,
    target_id: customIdentSchema,
    access_level: targetAccessLevelSchema,
    donor_secure: booleanSchema,
    donor_sub: targetSubSchema,
    donor_domain: targetDomainSchema,
    donor_port: targetPortSchema,
    mirror_secure: booleanSchema,
    mirror_sub: targetSubSchema,
    mirror_domain: targetDomainSchema,
    mirror_port: targetPortSchema,
    labels: targetLabelsSchema,
    connect_timeout: targetConnectTimeoutSchema,
    simple_timeout: targetSimpleTimeoutSchema,
    stream_timeout: targetStreamTimeoutSchema,
    headers_size_limit: targetHeadersSizeLimitSchema,
    body_size_limit: targetBodySizeLimitSchema,
    main_page: targetContentSchema,
    not_found_page: targetContentSchema,
    favicon_ico: targetContentSchema,
    robots_txt: targetContentSchema,
    sitemap_xml: targetContentSchema,
    allow_websockets: booleanSchema,
    is_enabled: booleanSchema,
    message_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Schema for validating target link.
 *
 * @category Target
 * @internal
 */
export const targetLinkSchema: JSONSchemaType<TargetLink> = {
  type: 'array',
  items: [customIdentSchema, customIdentSchema],
  minItems: 2,
  maxItems: 2,
} as const

/**
 * Schema for validating target hosts.
 *
 * @category Target
 * @internal
 */
export const targetHostsSchema: JSONSchemaType<TargetHosts> = {
  type: 'object',
  required: [],
  additionalProperties: targetLinkSchema,
} as const

/**
 * Collection of all schemas used by the target module.
 *
 * @category Target
 * @internal
 */
export const targetSchemas: ValidatorSchemas = {
  'database-raw-target': rawTargetSchema,
  'database-raw-full-target': rawFullTargetSchema,
  'database-target-link': targetLinkSchema,
  'database-target-hosts': targetHostsSchema,
} as const
