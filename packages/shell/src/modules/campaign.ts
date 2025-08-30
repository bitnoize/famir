import { DIContainer } from '@famir/common'
import { CampaignRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import { CampaignController } from '../controllers/index.js'
import {
  CreateCampaignUseCase,
  DeleteCampaignUseCase,
  ReadCampaignUseCase,
  UpdateCampaignUseCase
} from '../use-cases/index.js'

export const composeCampaign = (container: DIContainer) => {
  container.registerSingleton<CreateCampaignUseCase>(
    'CreateCampaignUseCase',
    (c) => new CreateCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<ReadCampaignUseCase>(
    'ReadCampaignUseCase',
    (c) => new ReadCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<UpdateCampaignUseCase>(
    'UpdateCampaignUseCase',
    (c) => new UpdateCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<DeleteCampaignUseCase>(
    'DeleteCampaignUseCase',
    (c) => new DeleteCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<CampaignController>(
    'CampaignController',
    (c) =>
      new CampaignController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<Context>('Context'),
        c.resolve<CreateCampaignUseCase>('CreateCampaignUseCase'),
        c.resolve<ReadCampaignUseCase>('ReadCampaignUseCase'),
        c.resolve<UpdateCampaignUseCase>('UpdateCampaignUseCase'),
        c.resolve<DeleteCampaignUseCase>('DeleteCampaignUseCase')
      )
  )

  container.resolve<CampaignController>('CampaignController')
}
