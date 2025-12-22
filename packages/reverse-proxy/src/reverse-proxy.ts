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
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  message?: MessageModel
}
