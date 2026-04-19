import { JSONSchemaType } from '@famir/validator'

/**
 * @category Schemas
 * @internal
 */
export const configHttpClientVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false,
} as const
