import { BullConsumeConfig } from '@famir/consume'
import { RedisDatabaseConfig } from '@famir/database'
import { PinoLoggerConfig } from '@famir/logger'
import { BullProduceConfig } from '@famir/produce'
import { MinioStorageConfig } from '@famir/storage'

/**
 * Config
 * @category Loaders
 */
export type StdAnalyzeConfig = PinoLoggerConfig &
  RedisDatabaseConfig &
  MinioStorageConfig &
  BullProduceConfig &
  BullConsumeConfig
