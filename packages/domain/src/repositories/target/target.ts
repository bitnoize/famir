import { EnabledTarget, Target } from '../../models/index.js'

export interface TargetRepository {
  create(
    id: string,
    isLanding: boolean,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorDomain: string,
    mirrorPort: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    successRedirectUrl: string,
    failureRedirectUrl: string
  ): Promise<void>
  read(id: string): Promise<Target | null>
  readEnabled(id: string): Promise<EnabledTarget | null>
  update(
    id: string,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    successRedirectUrl: string | null | undefined,
    failureRedirectUrl: string | null | undefined
  ): Promise<void>
  enable(id: string): Promise<void>
  disable(id: string): Promise<void>
  delete(id: string): Promise<void>
  list(): Promise<Target[] | null>
  listEnabled(): Promise<EnabledTarget[] | null>
}

/*
 
export interface CreateTargetDto {
  campaignId: string
  id: string
  isLanding: boolean
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorPort: number
  mainPage: string | null | undefined
  notFoundPage: string | null | undefined
  faviconIco: string | null | undefined
  robotsTxt: string | null | undefined
  sitemapXml: string | null | undefined
  successRedirectUrl: string | null | undefined
  failureRedirectUrl: string | null | undefined
}

export interface ReadTargetDto {
  campaignId: string
  id: string
}

export interface UpdateTargetDto {
  campaignId: string
  id: string
  mainPage: string | null | undefined
  notFoundPage: string | null | undefined
  faviconIco: string | null | undefined
  robotsTxt: string | null | undefined
  sitemapXml: string | null | undefined
  successRedirectUrl: string | null | undefined
  failureRedirectUrl: string | null | undefined
}

export interface ActionTargetDto {
  campaignId: string
  id: string
}

export interface DeleteTargetDto {
  campaignId: string
  id: string
}

export interface ListTargetsDto {
  campaignId: string
}


*/
