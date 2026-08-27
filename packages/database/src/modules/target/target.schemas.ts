import {
  JSONSchemaType,
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
 * JSON Schema for validating a target access level.
 *
 * @category Target
 */
export const targetAccessLevelSchema: JSONSchemaType<TargetAccessLevel> = {
  type: 'string',
  enum: [...TARGET_ACCESS_LEVELS],
} as const

/**
 * JSON Schema for validating a target subdomain.
 *
 * @category Target
 */
export const targetSubSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * JSON Schema for validating a target domain.
 *
 * @category Target
 */
export const targetDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * JSON Schema for validating a target port.
 *
 * @category Target
 */
export const targetPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535,
} as const

/**
 * JSON Schema for validating a target label.
 *
 * @category Target
 */
export const targetLabelSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 2,
  maxLength: 64,
}

/**
 * JSON Schema for validating a list of target labels.
 *
 * @category Target
 */
export const targetLabelsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: targetLabelSchema,
} as const

/**
 * JSON Schema for validating a target connection timeout.
 *
 * @category Target
 */
export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000,
} as const

/**
 * JSON Schema for validating a target simple request timeout.
 *
 * @category Target
 */
export const targetSimpleTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 300 * 1000,
} as const

/**
 * JSON Schema for validating a target streaming request timeout.
 *
 * @category Target
 */
export const targetStreamTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000,
} as const

/**
 * JSON Schema for validating a target headers size limit.
 *
 * @category Target
 */
export const targetHeadersSizeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1024 * 1024,
} as const

/**
 * JSON Schema for validating a target body size limit.
 *
 * @category Target
 */
export const targetBodySizeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1024 * 1024 * 1024,
} as const

/**
 * JSON Schema for validating target content.
 *
 * @category Target
 */
export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024,
} as const

/**
 * @category Target
 * @internal
 */
export const rawTargetSchema: JSONSchemaType<RawTarget> = {
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
 * @category Target
 * @internal
 */
export const rawFullTargetSchema: JSONSchemaType<RawFullTarget> = {
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
 * @category Target
 * @internal
 */
export const targetHostsSchema: JSONSchemaType<TargetHosts> = {
  type: 'object',
  required: [],
  additionalProperties: targetLinkSchema,
} as const
