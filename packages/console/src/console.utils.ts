import { ValidatorAssertSchema } from '@famir/domain'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function validateDto<T>(
  assertSchema: ValidatorAssertSchema,
  schema: string,
  data: unknown
): asserts data is T {
  assertSchema<T>(schema, data)
}
