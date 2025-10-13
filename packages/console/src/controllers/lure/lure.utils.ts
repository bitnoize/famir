import {
  createLureModelSchema,
  deleteLureModelSchema,
  listLureModelsSchema,
  readLureModelSchema,
  switchLureModelSchema
} from '@famir/database'
import {
  CreateLureModel,
  DeleteLureModel,
  ListLureModels,
  ReadLureModel,
  ReplServerError,
  SwitchLureModel,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-lure-model': createLureModelSchema,
  'read-lure-model': readLureModelSchema,
  'switch-lure-model': switchLureModelSchema,
  'delete-lure-model': deleteLureModelSchema,
  'list-lure-models': listLureModelsSchema
}
export function validateCreateLureModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateLureModel {
  try {
    assertSchema<CreateLureModel>('create-lure-model', data)
  } catch (error) {
    throw new ReplServerError(`CreateLureModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateReadLureModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadLureModel {
  try {
    assertSchema<ReadLureModel>('read-lure-model', data)
  } catch (error) {
    throw new ReplServerError(`ReadLureModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateSwitchLureModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is SwitchLureModel {
  try {
    assertSchema<SwitchLureModel>('switch-lure-model', data)
  } catch (error) {
    throw new ReplServerError(`SwitchLureModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateDeleteLureModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteLureModel {
  try {
    assertSchema<DeleteLureModel>('delete-lure-model', data)
  } catch (error) {
    throw new ReplServerError(`DeleteLureModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateListLureModels(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListLureModels {
  try {
    assertSchema<ListLureModels>('list-lure-models', data)
  } catch (error) {
    throw new ReplServerError(`ListLureModels validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}
