import {
  createRedirectorModelSchema,
  deleteRedirectorModelSchema,
  listRedirectorModelsSchema,
  readRedirectorModelSchema,
  updateRedirectorModelSchema
} from '@famir/database'
import {
  CreateRedirectorModel,
  DeleteRedirectorModel,
  ListRedirectorModels,
  ReadRedirectorModel,
  ReplServerError,
  UpdateRedirectorModel,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-redirector-model': createRedirectorModelSchema,
  'read-redirector-model': readRedirectorModelSchema,
  'update-redirector-model': updateRedirectorModelSchema,
  'delete-redirector-model': deleteRedirectorModelSchema,
  'list-redirector-models': listRedirectorModelsSchema
}
export function validateCreateRedirectorModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateRedirectorModel {
  try {
    assertSchema<CreateRedirectorModel>('create-redirector-model', data)
  } catch (error) {
    throw new ReplServerError(`CreateRedirectorModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateReadRedirectorModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadRedirectorModel {
  try {
    assertSchema<ReadRedirectorModel>('read-redirector-model', data)
  } catch (error) {
    throw new ReplServerError(`ReadRedirectorModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateUpdateRedirectorModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateRedirectorModel {
  try {
    assertSchema<UpdateRedirectorModel>('update-redirector-model', data)
  } catch (error) {
    throw new ReplServerError(`UpdateRedirectorModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateDeleteRedirectorModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteRedirectorModel {
  try {
    assertSchema<DeleteRedirectorModel>('delete-redirector-model', data)
  } catch (error) {
    throw new ReplServerError(`DeleteRedirectorModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateListRedirectorModels(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ListRedirectorModels {
  try {
    assertSchema<ListRedirectorModels>('list-redirector-models', data)
  } catch (error) {
    throw new ReplServerError(`ListRedirectorModels validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}
