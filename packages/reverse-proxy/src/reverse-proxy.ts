import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  SessionModel
} from '@famir/database'
import { HttpServerContextState } from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'

export interface ReverseProxyState extends HttpServerContextState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  message?: HttpMessage
}
