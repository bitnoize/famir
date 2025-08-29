import { Target, TargetRepository } from '@famir/domain'

export class ListTargetsUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(): Promise<Target[] | null> {
    return await this.targetRepository.list()
  }
}
