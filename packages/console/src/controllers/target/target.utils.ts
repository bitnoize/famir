import {
  createTargetDataSchema,
  deleteTargetDataSchema,
  listTargetsDataSchema,
  readTargetDataSchema,
  switchTargetDataSchema,
  updateTargetDataSchema
} from '@famir/database'
import {
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  ReplServerError,
  SwitchTargetData,
  UpdateTargetData,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-target-data': createTargetDataSchema,
  'read-target-data': readTargetDataSchema,
  'update-target-data': updateTargetDataSchema,
  'switch-target-data': switchTargetDataSchema,
  'delete-target-data': deleteTargetDataSchema,
  'list-targets-data': listTargetsDataSchema
}
export function validateCreateTargetData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateTargetData {
  try {
    assertSchema<CreateTargetData>('create-target-data', data)
  } catch (error) {
    throw new ReplServerError(`CreateTargetData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateReadTargetData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadTargetData {
  try {
    assertSchema<ReadTargetData>('read-target-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadTargetData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateUpdateTargetData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateTargetData {
  try {
    assertSchema<UpdateTargetData>('update-target-data', data)
  } catch (error) {
    throw new ReplServerError(`UpdateTargetData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateSwitchTargetData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is SwitchTargetData {
  try {
    assertSchema<SwitchTargetData>('switch-target-data', data)
  } catch (error) {
    throw new ReplServerError(`SwitchTargetData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateDeleteTargetData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteTargetData {
  try {
    assertSchema<DeleteTargetData>('delete-target-data', data)
  } catch (error) {
    throw new ReplServerError(`DeleteTargetData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateListTargetsData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListTargetsData {
  try {
    assertSchema<ListTargetsData>('list-targets-data', data)
  } catch (error) {
    throw new ReplServerError(`ListTargetsData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
