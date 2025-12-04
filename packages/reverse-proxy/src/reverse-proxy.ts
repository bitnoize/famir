import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpState,
  MessageModel,
  SessionModel
} from '@famir/domain'

import { DatabaseConfig } from '@famir/database'
import { HttpClientConfig } from '@famir/http-client'
import { HttpServerConfig } from '@famir/http-server'
import { LoggerConfig } from '@famir/logger'
import { WorkflowConfig } from '@famir/workflow'

export type ReverseProxyConfig = LoggerConfig &
  DatabaseConfig &
  WorkflowConfig &
  HttpClientConfig &
  HttpServerConfig

export interface ReverseProxyState extends HttpState {
  isSetupMirror?: boolean
  campaign?: FullCampaignModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  isAuthorize?: boolean
  session?: SessionModel
  proxy?: EnabledProxyModel
  isComplete?: boolean
  message?: MessageModel
}

export interface SetupMirrorState {
  readonly isSetupMirror: true
  readonly campaign: FullCampaignModel
  readonly target: EnabledFullTargetModel
  readonly targets: EnabledTargetModel[]
}

export interface AuthorizeState {
  readonly isAuthorize: true
  readonly session: SessionModel
  readonly proxy: EnabledProxyModel
}

export interface CompleteState {
  readonly isComplete: true
  readonly message: MessageModel
}
