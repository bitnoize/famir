import { CampaignRepository, HttpServerError, TargetRepository } from '@famir/domain'
import { ConfigurationData, ConfigurationResult } from './configuration.js'

export class ConfigurationUseCase {
  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: ConfigurationData): Promise<ConfigurationResult> {
    const campaign = await this.campaignRepository.read({
      id: data.campaignId
    })

    if (campaign === null) {
      throw new HttpServerError(`Campaign not found`, {
        context: {
          useCase: 'configuration'
        },
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    const target = await this.targetRepository.read({
      campaignId: data.campaignId,
      id: data.targetId
    })

    if (target === null) {
      throw new HttpServerError(`Target not found`, {
        context: {
          useCase: 'configuration'
        },
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    return { campaign, target }
  }
}
