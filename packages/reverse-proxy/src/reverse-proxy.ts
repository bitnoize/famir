import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  SessionModel
} from '@famir/database'
import { HttpServerContextState } from '@famir/http-server'
import { ReverseProxyForward } from './reverse-proxy-forward.js'

export interface ReverseProxyState extends HttpServerContextState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  forward?: ReverseProxyForward
}
