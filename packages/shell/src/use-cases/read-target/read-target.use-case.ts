import { Target, TargetRepository } from '@famir/domain'
import { ReadTargetDto } from './read-target.js'

export class ReadTargetUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(dto: ReadTargetDto): Promise<Target | null> {
    return await this.targetRepository.read(dto.id)
  }
}
