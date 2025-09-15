import { ValidatorAssertSchema } from '@famir/domain'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function buildConfig<T>(assertSchema: ValidatorAssertSchema): T {
  try {
    const data = { ...process.env }

    assertSchema<T>('config', data)

    return data
  } catch (error) {
    console.error(`Build config error`, { error })

    process.exit(1)
  }
}
