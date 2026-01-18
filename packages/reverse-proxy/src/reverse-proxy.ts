import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpState,
  MessageModel,
  SessionModel
} from '@famir/domain'

export interface ReverseProxyState extends HttpState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: EnabledTargetModel[]
  session?: SessionModel
  message?: MessageModel
}
