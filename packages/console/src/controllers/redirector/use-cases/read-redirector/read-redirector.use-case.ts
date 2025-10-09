import { DIContainer } from '@famir/common'
import {
  ReadRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository
} from '@famir/domain'

export const READ_REDIRECTOR_USE_CASE = Symbol('ReadRedirectorUseCase')

export class ReadRedirectorUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadRedirectorUseCase>(
      READ_REDIRECTOR_USE_CASE,
      (c) => new ReadRedirectorUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly redirectorRepository: RedirectorRepository) {}

  async execute(data: ReadRedirectorModel): Promise<RedirectorModel | null> {
    return await this.redirectorRepository.read(data)
  }
}
