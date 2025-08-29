import { JSONSchemaType } from '@famir/validator'

export const campaignDescriptionSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 1024
} as const

export const campaignSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 3600 * 1000,
  maximum: 365 * 24 * 3600 * 1000
} as const

export const campaignNewSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 900 * 1000
} as const

export const campaignSessionLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000
} as const

export const campaignSessionEmergeIdleTimeSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 3600 * 1000
} as const

export const campaignSessionEmergeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000
} as const

export const campaignMessageExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 24 * 3600 * 1000
} as const

export const campaignMessageLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100_000
} as const

export const campaignMessageEmergeIdleTimeSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 3600 * 1000
} as const

export const campaignMessageEmergeLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000
} as const

export const campaignMessageLockExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 3600 * 1000
} as const
