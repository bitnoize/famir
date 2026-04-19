import { JSONSchemaType } from '@famir/validator'

/**
 * @category none
 * @internal
 */
export const configHttpClientVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
} as const
