import {
  createLureDataSchema,
  deleteLureDataSchema,
  listLuresDataSchema,
  readLureDataSchema,
  switchLureDataSchema
} from '@famir/database'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  ReplServerError,
  SwitchLureData,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-lure-data': createLureDataSchema,
  'read-lure-data': readLureDataSchema,
  'switch-lure-data': switchLureDataSchema,
  'delete-lure-data': deleteLureDataSchema,
  'list-lures-data': listLuresDataSchema
}
export function validateCreateLureData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateLureData {
  try {
    assertSchema<CreateLureData>('create-lure-data', data)
  } catch (error) {
    throw new ReplServerError(`CreateLureData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateReadLureData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadLureData {
  try {
    assertSchema<ReadLureData>('read-lure-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadLureData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateSwitchLureData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is SwitchLureData {
  try {
    assertSchema<SwitchLureData>('switch-lure-data', data)
  } catch (error) {
    throw new ReplServerError(`SwitchLureData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateDeleteLureData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteLureData {
  try {
    assertSchema<DeleteLureData>('delete-lure-data', data)
  } catch (error) {
    throw new ReplServerError(`DeleteLureData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateListLuresData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListLuresData {
  try {
    assertSchema<ListLuresData>('list-lures-data', data)
  } catch (error) {
    throw new ReplServerError(`ListLuresData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
