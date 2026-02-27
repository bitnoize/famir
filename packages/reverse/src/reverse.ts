import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  SessionModel
} from '@famir/database'
import { HttpServerContextState } from '@famir/http-server'
import { type ReverseMessage } from './reverse-message.js'

export interface ReverseState extends HttpServerContextState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  message?: ReverseMessage
}
