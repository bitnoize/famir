import { TargetRepository } from '@famir/domain'
import { EnableTargetDto } from './enable-target.js'

export class EnableTargetUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(dto: EnableTargetDto): Promise<true> {
    await this.targetRepository.enable(dto.id)

    return true
  }
}
