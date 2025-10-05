import {
  createProxyDataSchema,
  deleteProxyDataSchema,
  readProxyDataSchema,
  switchProxyDataSchema
} from '@famir/database'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  ReplServerError,
  SwitchProxyData,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-proxy-data': createProxyDataSchema,
  'read-proxy-data': readProxyDataSchema,
  'switch-proxy-data': switchProxyDataSchema,
  'delete-proxy-data': deleteProxyDataSchema
}
export function validateCreateProxyData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateProxyData {
  try {
    assertSchema<CreateProxyData>('create-proxy-data', data)
  } catch (error) {
    throw new ReplServerError(`CreateProxyData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateReadProxyData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadProxyData {
  try {
    assertSchema<ReadProxyData>('read-proxy-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadProxyData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateSwitchProxyData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is SwitchProxyData {
  try {
    assertSchema<SwitchProxyData>('switch-proxy-data', data)
  } catch (error) {
    throw new ReplServerError(`SwitchProxyData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateDeleteProxyData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteProxyData {
  try {
    assertSchema<DeleteProxyData>('delete-proxy-data', data)
  } catch (error) {
    throw new ReplServerError(`DeleteProxyData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateListProxiesData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListProxiesData {
  try {
    assertSchema<ListProxiesData>('list-proxies-data', data)
  } catch (error) {
    throw new ReplServerError(`ListProxiesData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
