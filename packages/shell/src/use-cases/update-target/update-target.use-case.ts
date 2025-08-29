import { TargetRepository } from '@famir/domain'
import { UpdateTargetDto } from './update-target.js'

export class UpdateTargetUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(dto: UpdateTargetDto): Promise<true> {
    await this.targetRepository.update(
      dto.id,
      dto.mainPage,
      dto.notFoundPage,
      dto.faviconIco,
      dto.robotsTxt,
      dto.sitemapXml,
      dto.successRedirectUrl,
      dto.failureRedirectUrl
    )

    return true
  }
}
