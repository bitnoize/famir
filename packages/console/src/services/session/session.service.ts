import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  ReadSessionModel,
  ReplServerError,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const SESSION_SERVICE = Symbol('SessionService')

export class SessionService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionService>(
      SESSION_SERVICE,
      (c) =>
        new SessionService(
          c.resolve<Logger>(LOGGER),
          c.resolve<SessionRepository>(SESSION_REPOSITORY)
        )
    )
  }

  constructor(
    logger: Logger,
    protected readonly sessionRepository: SessionRepository
  ) {
    super(logger)

    this.logger.debug(`SessionService initialized`)
  }

  async read(data: ReadSessionModel): Promise<SessionModel> {
    const session = await this.sessionRepository.read(data)

    if (!session) {
      throw new ReplServerError(`Session not found`, {
        code: 'NOT_FOUND'
      })
    }

    return session
  }
}
