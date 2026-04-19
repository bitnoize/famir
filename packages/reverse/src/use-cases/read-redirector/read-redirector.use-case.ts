import { DIContainer } from '@famir/common'
import { FullRedirectorModel, REDIRECTOR_REPOSITORY, RedirectorRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { READ_REDIRECTOR_USE_CASE, ReadRedirectorData } from './read-redirector.js'

/*
 * Read redirector use-case
 */
export class ReadRedirectorUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReadRedirectorUseCase>(
      READ_REDIRECTOR_USE_CASE,
      (c) => new ReadRedirectorUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(protected readonly redirectorRepository: RedirectorRepository) {}

  /*
   * Execute use-case
   */
  async execute(data: ReadRedirectorData): Promise<FullRedirectorModel> {
    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read redirector failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    return redirector
  }
}
