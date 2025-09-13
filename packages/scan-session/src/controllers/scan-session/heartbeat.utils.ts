import { ValidatorAssertSchema } from '@famir/validator'
import { validateDto } from '../../heartbeat.utils.js'
import { ScanSessionDto, ScanMessageDto } from '../../use-cases/index.js'

export function validateScanSessionDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ScanSessionDto {
  validateDto<ScanSessionDto>(assertSchema, 'scan-session-dto', data, 'scanSessionDto')
}

export function validateScanMessageDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ScanMessageDto {
  validateDto<ScanMessageDto>(assertSchema, 'scan-message-dto', data, 'scanMessageDto')
}
