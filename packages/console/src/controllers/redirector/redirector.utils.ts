import {
  createRedirectorDataSchema,
  deleteRedirectorDataSchema,
  listRedirectorsDataSchema,
  readRedirectorDataSchema,
  updateRedirectorDataSchema
} from '@famir/database'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  ReplServerError,
  UpdateRedirectorData,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-redirector-data': createRedirectorDataSchema,
  'read-redirector-data': readRedirectorDataSchema,
  'update-redirector-data': updateRedirectorDataSchema,
  'delete-redirector-data': deleteRedirectorDataSchema,
  'list-redirectors-data': listRedirectorsDataSchema
}
export function validateCreateRedirectorData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateRedirectorData {
  try {
    assertSchema<CreateRedirectorData>('create-redirector-data', data)
  } catch (error) {
    throw new ReplServerError(`CreateRedirectorData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateReadRedirectorData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadRedirectorData {
  try {
    assertSchema<ReadRedirectorData>('read-redirector-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadRedirectorData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateUpdateRedirectorData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateRedirectorData {
  try {
    assertSchema<UpdateRedirectorData>('update-redirector-data', data)
  } catch (error) {
    throw new ReplServerError(`UpdateRedirectorData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateDeleteRedirectorData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteRedirectorData {
  try {
    assertSchema<DeleteRedirectorData>('delete-redirector-data', data)
  } catch (error) {
    throw new ReplServerError(`DeleteRedirectorData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateListRedirectorsData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListRedirectorsData {
  try {
    assertSchema<ListRedirectorsData>('list-redirectors-data', data)
  } catch (error) {
    throw new ReplServerError(`ListRedirectorsData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
