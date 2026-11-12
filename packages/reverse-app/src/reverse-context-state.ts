import {
  type EnabledFullTargetModel,
  type EnabledProxyModel,
  type FullCampaignModel,
  type SessionModel,
  type TargetModel,
} from '@famir/domain'
import { HttpServerContextState } from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'

/**
 * Represents the reverse context state.
 *
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
