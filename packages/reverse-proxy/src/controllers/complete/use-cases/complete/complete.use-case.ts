import { DIContainer } from '@famir/common'
import { MESSAGE_REPOSITORY, MessageRepository } from '@famir/domain'
import { CompleteData } from './complete.js'

export const COMPLETE_USE_CASE = Symbol('CompleteUseCase')

export class CompleteUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteUseCase>(
      COMPLETE_USE_CASE,
      (c) => new CompleteUseCase(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {}

  async execute(data: CompleteData): Promise<void> {
    const { target, createMessage, response } = data

    await this.messageRepository.create(createMessage)

    response.status = createMessage.status

    Object.entries(createMessage.responseHeaders)
      .forEach(([name, value]) => {
        if (!value) {
          return
        }

        response.headers[name] = value
      })

    Object.entries(createMessage.responseCookies)
      .forEach(([name, cookie]) => {
        if (!cookie) {
          return
        }

        response.cookies[name] = {
          value: cookie.value ?? undefined,
          maxAge: cookie.maxAge ?? undefined,
          expires: cookie.expires != null ? new Date(cookie.expires) : undefined,
          httpOnly: cookie.httpOnly ?? undefined,
          path: cookie.path ?? undefined,
          domain: cookie.domain ?? undefined,
          secure: cookie.secure ?? undefined,
          sameSite: cookie.sameSite ?? undefined
        }
      })

    response.body = createMessage.responseBody
  }
}
