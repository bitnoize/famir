export interface CreateTargetDto {
  id: string
  isLanding: boolean
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorDomain: string
  mirrorPort: number
  mainPage: string | null | undefined
  notFoundPage: string | null | undefined
  faviconIco: string | null | undefined
  robotsTxt: string | null | undefined
  sitemapXml: string | null | undefined
  successRedirectUrl: string | null | undefined
  failureRedirectUrl: string | null | undefined
}
