import { SessionRepository } from '@famir/domain'
import { HeartbeatResult, ScanSessionQueue } from '@famir/task-queue'

export class ScanMessagesUseCase {
  constructor(
    protected readonly sessionRepository: SessionRepository,
    protected readonly scanSessionQueue: ScanSessionQueue
  ) {}

  async execute(): Promise<HeartbeatResult> {
    const taskCount = await this.scanSessionQueue.getTaskCount()

    if (taskCount > 0) {
      return 0
    }

    const sessionIndex = await this.sessionRepository.emergeLoopIndex()

    if (sessionIndex === null) {
      return 0
    }

    for (const sessionId of sessionIndex) {
      await this.scanSessionQueue.addTask(sessionId)
    }

    return sessionIndex.length
  }
}
