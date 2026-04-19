import { JSONSchemaType } from '@famir/validator'

/**
 * @category none
 * @internal
 */
export const configHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
} as const

/**
 * @category none
 * @internal
 */
export const configHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535,
} as const

/**
 * @category none
 * @internal
 */
export const configHttpServerVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
} as const
