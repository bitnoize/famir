import { DIContainer } from '@famir/common'
import { FullMessageModel } from '@famir/database'
import { Storage, STORAGE } from '@famir/storage'

export const SAVE_MESSAGE_USE_CASE = Symbol('SaveMessageUseCase')

export class SaveMessageUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<SaveMessageUseCase>(
      SAVE_MESSAGE_USE_CASE,
      (c) => new SaveMessageUseCase(c.resolve<Storage>(STORAGE))
    )
  }

  constructor(protected readonly storage: Storage) {}

  async execute(message: FullMessageModel): Promise<void> {
    const basePath = `${message.campaignId}/${message.sessionId}/${message.messageId}`

    const main = Buffer.from(
      JSON.stringify({
        campaignId: message.campaignId,
        messageId: message.messageId,
        proxyId: message.proxyId,
        targetId: message.targetId,
        sessionId: message.sessionId,
        kind: message.kind,
        method: message.method,
        url: message.url,
        status: message.status,
        score: message.score,
        ip: message.ip,
        startTime: message.startTime,
        finishTime: message.finishTime
      })
    )
    await this.storage.putObject(`${basePath}/message.json`, main, {
      'Content-Type': 'application/json'
    })

    const requestHeaders = Buffer.from(JSON.stringify(message.requestHeaders))
    await this.storage.putObject(`${basePath}/request-headers.json`, requestHeaders, {
      'Content-Type': 'application/json'
    })

    if (message.requestBody.length > 0) {
      await this.storage.putObject(`${basePath}/request-body.bin`, message.requestBody, {
        'Content-Type': 'application/octet-stream'
      })
    }

    const responseHeaders = Buffer.from(JSON.stringify(message.responseHeaders))
    await this.storage.putObject(`${basePath}/response-headers.json`, responseHeaders, {
      'Content-Type': 'application/json'
    })

    if (message.responseBody.length > 0) {
      await this.storage.putObject(`${basePath}/response-body.bin`, message.responseBody, {
        'Content-Type': 'application/octet-stream'
      })
    }

    if (Object.keys(message.connection).length > 0) {
      const connection = Buffer.from(JSON.stringify(message.connection))
      await this.storage.putObject(`${basePath}/connection.json`, connection, {
        'Content-Type': 'application/json'
      })
    }

    if (Object.keys(message.payload).length > 0) {
      const payload = Buffer.from(JSON.stringify(message.payload))
      await this.storage.putObject(`${basePath}/payload.json`, payload, {
        'Content-Type': 'application/json'
      })
    }

    if (message.errors.length > 0) {
      const errors = Buffer.from(JSON.stringify(message.errors))
      await this.storage.putObject(`${basePath}/errors.json`, errors, {
        'Content-Type': 'application/json'
      })
    }
  }
}
