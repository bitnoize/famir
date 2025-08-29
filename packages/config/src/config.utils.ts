import { ValidatorAssertSchema } from '@famir/validator'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function buildConfig<T>(assertSchema: ValidatorAssertSchema): T {
  try {
    const data = { ...process.env }

    assertSchema<T>('config', data, 'config')

    return data
  } catch (error) {
    console.error(`Config validation failed`, { error })

    process.exit(1)
  }
}
