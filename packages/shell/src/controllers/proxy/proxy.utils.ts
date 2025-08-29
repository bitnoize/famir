import { ValidatorAssertSchema } from '@famir/validator'
import { validateDto } from '../../shell.utils.js'
import {
  CreateProxyDto,
  DeleteProxyDto,
  DisableProxyDto,
  EnableProxyDto,
  ReadProxyDto
} from '../../use-cases/index.js'

export function validateCreateProxyDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateProxyDto {
  validateDto<CreateProxyDto>(assertSchema, 'create-proxy-dto', data, 'createProxyDto')
}

export function validateReadProxyDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadProxyDto {
  validateDto<ReadProxyDto>(assertSchema, 'read-proxy-dto', data, 'readProxyDto')
}

export function validateEnableProxyDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is EnableProxyDto {
  validateDto<EnableProxyDto>(assertSchema, 'enable-proxy-dto', data, 'enableProxyDto')
}

export function validateDisableProxyDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DisableProxyDto {
  validateDto<DisableProxyDto>(assertSchema, 'disable-proxy-dto', data, 'disableProxyDto')
}

export function validateDeleteProxyDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteProxyDto {
  validateDto<DeleteProxyDto>(assertSchema, 'delete-proxy-dto', data, 'deleteProxyDto')
}
