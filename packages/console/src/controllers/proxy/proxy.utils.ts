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
    throw new ReplServerError(`CreateProxyModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
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
    throw new ReplServerError(`ReadProxyModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
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
    throw new ReplServerError(`SwitchProxyModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
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
    throw new ReplServerError(`DeleteProxyModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
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
    throw new ReplServerError(`ListProxyModels validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
