import {
  type EnabledTargetModel,
  type EnabledProxyModel,
  type CampaignModel,
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
  campaign?: CampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledTargetModel
  targets?: TargetModel[]
  session?: SessionModel
  message?: HttpMessage
}
