import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpServerContextState,
  SessionModel
} from '@famir/domain'
import { ReverseProxyForward } from './reverse-proxy-forward.js'

export interface ReverseProxyState extends HttpServerContextState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  forward?: ReverseProxyForward
}
