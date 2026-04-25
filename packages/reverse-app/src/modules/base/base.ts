import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  FullCampaignModel,
  SessionModel,
  TargetModel,
} from '@famir/database'
import { HttpServerContextState } from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'

/**
 * @category none
 */
export interface ReverseContextState extends HttpServerContextState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: TargetModel[]
  session?: SessionModel
  message?: HttpMessage
}
