import {
  createTargetModelSchema,
  deleteTargetModelSchema,
  listTargetModelsSchema,
  readTargetModelSchema,
  switchTargetModelSchema,
  updateTargetModelSchema
} from '@famir/database'
import {
  CreateTargetModel,
  DeleteTargetModel,
  ListTargetModels,
  ReadTargetModel,
  ReplServerError,
  SwitchTargetModel,
  UpdateTargetModel,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-target-model': createTargetModelSchema,
  'read-target-model': readTargetModelSchema,
  'update-target-model': updateTargetModelSchema,
  'switch-target-model': switchTargetModelSchema,
  'delete-target-model': deleteTargetModelSchema,
  'list-target-models': listTargetModelsSchema
}
export function validateCreateTargetModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateTargetModel {
  try {
    assertSchema<CreateTargetModel>('create-target-model', data)
  } catch (error) {
    throw new ReplServerError(`CreateTargetModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateReadTargetModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadTargetModel {
  try {
    assertSchema<ReadTargetModel>('read-target-model', data)
  } catch (error) {
    throw new ReplServerError(`ReadTargetModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateUpdateTargetModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateTargetModel {
  try {
    assertSchema<UpdateTargetModel>('update-target-model', data)
  } catch (error) {
    throw new ReplServerError(`UpdateTargetModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateSwitchTargetModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is SwitchTargetModel {
  try {
    assertSchema<SwitchTargetModel>('switch-target-model', data)
  } catch (error) {
    throw new ReplServerError(`SwitchTargetModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateDeleteTargetModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteTargetModel {
  try {
    assertSchema<DeleteTargetModel>('delete-target-model', data)
  } catch (error) {
    throw new ReplServerError(`DeleteTargetModel validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateListTargetModels(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListTargetModels {
  try {
    assertSchema<ListTargetModels>('list-target-models', data)
  } catch (error) {
    throw new ReplServerError(`ListTargetModels validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
