import { ReplServerError } from '@famir/repl-server'
import { ValidatorAssertSchema } from '@famir/validator'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function validateDto<T>(
  assertSchema: ValidatorAssertSchema,
  schema: string,
  data: unknown,
  entry: string
): asserts data is T {
  try {
    assertSchema<T>(schema, data, entry)
  } catch (error) {
    throw new ReplServerError(
      'INTERNAL_ERROR',
      {
        cause: error
      },
      `Validation DTO failed`
    )
  }
}
