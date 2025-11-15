import { DIContainer } from '@famir/common'
import {
  EnabledTargetModel,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'
import { GetTargetsData, GetTargetsReply } from './get-targets.js'

export const GET_TARGETS_USE_CASE = Symbol('GetTargetsUseCase')

export class GetTargetsUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<GetTargetsUseCase>(
      GET_TARGETS_USE_CASE,
      (c) => new GetTargetsUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(protected readonly targetRepository: TargetRepository) {}

  async execute(data: GetTargetsData): Promise<GetTargetsReply> {
    const targetCollection = await this.targetRepository.listTargets({
      campaignId: data.campaignId
    })

    if (!targetCollection) {
      throw new HttpServerError(`Campaign not found`, {
        code: 'UNPROCESSABLE_CONTENT'
      })
    }

    return {
      targets: targetCollection.filter(this.guardEnabledTarget)
    }
  }

  protected guardEnabledTarget = (value: TargetModel): value is EnabledTargetModel => {
    return value.isEnabled
  }
}
