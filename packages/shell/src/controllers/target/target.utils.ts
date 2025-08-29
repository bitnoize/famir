import { ValidatorAssertSchema } from '@famir/validator'
import { validateDto } from '../../shell.utils.js'
import {
  CreateTargetDto,
  DeleteTargetDto,
  DisableTargetDto,
  EnableTargetDto,
  ReadTargetDto,
  UpdateTargetDto
} from '../../use-cases/index.js'

export function validateCreateTargetDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateTargetDto {
  validateDto<CreateTargetDto>(assertSchema, 'create-target-dto', data, 'createTargetDto')
}

export function validateReadTargetDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadTargetDto {
  validateDto<ReadTargetDto>(assertSchema, 'read-target-dto', data, 'readTargetDto')
}

export function validateUpdateTargetDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateTargetDto {
  validateDto<UpdateTargetDto>(assertSchema, 'update-target-dto', data, 'updateTargetDto')
}

export function validateEnableTargetDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is EnableTargetDto {
  validateDto<EnableTargetDto>(assertSchema, 'enable-target-dto', data, 'enableTargetDto')
}

export function validateDisableTargetDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DisableTargetDto {
  validateDto<DisableTargetDto>(assertSchema, 'disable-target-dto', data, 'disableTargetDto')
}

export function validateDeleteTargetDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteTargetDto {
  validateDto<DeleteTargetDto>(assertSchema, 'delete-target-dto', data, 'deleteTargetDto')
}
