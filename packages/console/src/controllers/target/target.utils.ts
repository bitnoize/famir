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
    throw new ReplServerError(`Create target data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
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
    throw new ReplServerError(`Read target data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
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
    throw new ReplServerError(`Update target data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
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
    throw new ReplServerError(`Switch target data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
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
    throw new ReplServerError(`Delete target data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
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
    throw new ReplServerError(`List targets data validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}
