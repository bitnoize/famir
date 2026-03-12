export interface LandingUpgradeData {
  lure_id: string
  session_id: string
  secret: string
  back_url: string
}

export interface LandingLureData {
  [key: string]: string | undefined
  og_title?: string
  og_description?: string
  og_image?: string
  og_url?: string
  upgrade_url?: string
  back_url?: string
}
