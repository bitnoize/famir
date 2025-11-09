import {
  createProxyModelSchema,
  deleteProxyModelSchema,
  listProxyModelsSchema,
  readProxyModelSchema,
  switchProxyModelSchema
} from '@famir/database'
import {
  CreateProxyModel,
  DeleteProxyModel,
  ListProxyModels,
  ReadProxyModel,
  ReplServerError,
  SwitchProxyModel,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-proxy-model': createProxyModelSchema,
  'read-proxy-model': readProxyModelSchema,
  'switch-proxy-model': switchProxyModelSchema,
  'delete-proxy-model': deleteProxyModelSchema,
  'list-proxy-models': listProxyModelsSchema
}
export function validateCreateProxyModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateProxyModel {
  try {
    assertSchema<CreateProxyModel>('create-proxy-model', data)
  } catch (error) {
    throw new ReplServerError(`Create proxy data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateReadProxyModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadProxyModel {
  try {
    assertSchema<ReadProxyModel>('read-proxy-model', data)
  } catch (error) {
    throw new ReplServerError(`Read proxy data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateSwitchProxyModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is SwitchProxyModel {
  try {
    assertSchema<SwitchProxyModel>('switch-proxy-model', data)
  } catch (error) {
    throw new ReplServerError(`Switch proxy data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateDeleteProxyModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteProxyModel {
  try {
    assertSchema<DeleteProxyModel>('delete-proxy-model', data)
  } catch (error) {
    throw new ReplServerError(`Delete proxy data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateListProxyModels(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListProxyModels {
  try {
    assertSchema<ListProxyModels>('list-proxy-models', data)
  } catch (error) {
    throw new ReplServerError(`List proxies data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}
