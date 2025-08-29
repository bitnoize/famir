import { TargetRepository } from '@famir/domain'
import { CreateTargetDto } from './create-target.js'

export class CreateTargetUseCase {
  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(dto: CreateTargetDto): Promise<true> {
    await this.targetRepository.create(
      dto.id,
      dto.isLanding,
      dto.donorSecure,
      dto.donorSub,
      dto.donorDomain,
      dto.donorPort,
      dto.mirrorSecure,
      dto.mirrorSub,
      dto.mirrorDomain,
      dto.mirrorPort,
      dto.mainPage ?? '',
      dto.notFoundPage ?? '',
      dto.faviconIco ?? '',
      dto.robotsTxt ?? '',
      dto.sitemapXml ?? '',
      dto.successRedirectUrl ?? '/',
      dto.failureRedirectUrl ?? '/'
    )

    return true
  }
}
