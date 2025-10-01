import { DIContainer } from '@famir/common'
import {
  Logger,
  ReplServerContext,
  Validator,
  CampaignRepository
} from '@famir/domain'
import { CampaignController } from '../controllers/index.js'
import {
  CreateCampaignUseCase,
  DeleteCampaignUseCase,
  ListCampaignsUseCase,
  ReadCampaignUseCase,
  UpdateCampaignUseCase
} from '../use-cases/index.js'

export const composeCampaign = (container: DIContainer) => {
  container.registerSingleton<CreateCampaignUseCase>(
    'CreateCampaignUseCase',
    (c) =>
      new CreateCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<ReadCampaignUseCase>(
    'ReadCampaignUseCase',
    (c) =>
      new ReadCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<UpdateCampaignUseCase>(
    'UpdateCampaignUseCase',
    (c) =>
      new UpdateCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<DeleteCampaignUseCase>(
    'DeleteCampaignUseCase',
    (c) =>
      new DeleteCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<ListCampaignsUseCase>(
    'ListCampaignsUseCase',
    (c) =>
      new ListCampaignsUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )


  container.registerSingleton<CampaignController>(
    'CampaignController',
    (c) =>
      new CampaignController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<ReplServerContext>('ReplServerContext'),
        c.resolve<CreateCampaignUseCase>('CreateCampaignUseCase'),
        c.resolve<ReadCampaignUseCase>('ReadCampaignUseCase'),
        c.resolve<UpdateCampaignUseCase>('UpdateCampaignUseCase'),
        c.resolve<DeleteCampaignUseCase>('DeleteCampaignUseCase'),
        c.resolve<ListCampaignsUseCase>('ListCampaignsUseCase'),
      )
  )

  container.resolve<CampaignController>('CampaignController')
}
