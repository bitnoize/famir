import { TargetRepository } from '@famir/domain'
import { DisableTargetDto } from './disable-target.js'

export class DisableTargetUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(dto: DisableTargetDto): Promise<true> {
    await this.targetRepository.disable(dto.id)

    return true
  }
}
