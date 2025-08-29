import { TargetRepository } from '@famir/domain'
import { DeleteTargetDto } from './delete-target.js'

export class DeleteTargetUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(dto: DeleteTargetDto): Promise<true> {
    await this.targetRepository.delete(dto.id)

    return true
  }
}
