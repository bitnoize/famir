import { DIContainer } from '@famir/common'
import { ReadSessionData, SESSION_REPOSITORY, SessionModel, SessionRepository } from '@famir/domain'

export const READ_SESSION_USE_CASE = Symbol('ReadSessionUseCase')

export class ReadSessionUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadSessionUseCase>(
      READ_SESSION_USE_CASE,
      (c) => new ReadSessionUseCase(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(data: ReadSessionData): Promise<SessionModel | null> {
    return await this.sessionRepository.read(data)
  }
}
